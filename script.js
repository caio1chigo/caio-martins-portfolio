// ===== ELEMENTOS PRINCIPAIS =====

const loader = document.getElementById("loader");

const secaoCapa = document.querySelector(".secao-capa");
const capaFundo = document.querySelector(".capa-fundo");
const capaConteudo = document.querySelector(".capa-conteudo");

const secaoSolucoes = document.querySelector(".secao-transicao");
const mensagemSolucoes = document.querySelector(".solucoes-mensagem");

const secoes = document.querySelectorAll(
  ".secao:not(.secao-capa)"
);

const gtaCards = document.querySelectorAll(".gta-card");

// ===== LOADER =====

window.addEventListener("load", () => {
  if (!loader) {
    iniciarCapa();
    return;
  }

  setTimeout(() => {
    loader.classList.add("loader-saindo");

    loader.addEventListener(
      "transitionend",
      () => {
        loader.style.display = "none";
        iniciarCapa();
      },
      { once: true }
    );
  }, 2000);
});

// ===== CAPA: ENTRADA SUAVE + FADE CONTÍNUO =====

function iniciarCapa() {
  if (!secaoCapa || !capaFundo || !capaConteudo) return;

  /*
    O CSS da imagem deve iniciar com:
    opacity: 0;
    transform: scale(1.04);

    A classe abaixo permite a entrada suave
    depois que o loader desaparece.
  */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      capaFundo.classList.add("capa-carregada");
      atualizarCapa();
    });
  });

  let frameAgendado = false;

  function atualizarCapa() {
    const alturaCapa = secaoCapa.offsetHeight;

    if (!alturaCapa) {
      frameAgendado = false;
      return;
    }

    /*
      Progresso:
      0 = usuário está no topo da capa.
      1 = usuário já rolou uma altura inteira da capa.
    */
    const progresso = Math.min(
      Math.max(window.scrollY / alturaCapa, 0),
      1
    );

    /* Fundo: fade mais lento + leve movimento. */
    const opacidadeImagem = Math.max(1 - progresso * 1.05, 0);
    const escalaImagem = 1 - progresso * 0.05;
    const deslocamentoImagem = progresso * 45;

    capaFundo.style.opacity = String(opacidadeImagem);
    capaFundo.style.transform =
      `translate3d(0, -${deslocamentoImagem}px, 0) scale(${escalaImagem})`;

    /* Textos: somem um pouco antes do fundo. */
    const opacidadeTexto = Math.max(1 - progresso * 1.35, 0);
    const escalaTexto = 1 - progresso * 0.035;
    const deslocamentoTexto = progresso * 34;

    capaConteudo.style.opacity = String(opacidadeTexto);
    capaConteudo.style.transform =
  `translate(-50%, -50%) translateY(-${deslocamentoTexto}px) scale(${escalaTexto})`;

    frameAgendado = false;
  }

  function agendarAtualizacaoCapa() {
    if (frameAgendado) return;

    frameAgendado = true;
    requestAnimationFrame(atualizarCapa);
  }

  window.addEventListener("scroll", agendarAtualizacaoCapa, {
    passive: true,
  });

  window.addEventListener("resize", agendarAtualizacaoCapa);
}

// ===== SOLUÇÕES: FADE-IN E FADE-OUT CONTÍNUO =====

if (secaoSolucoes && mensagemSolucoes) {
  if ("IntersectionObserver" in window) {
    const observerSolucoes = new IntersectionObserver(
      ([entrada]) => {
        /*
          Não usamos unobserve().
          Assim, .visivel é adicionada ao entrar e removida ao sair,
          funcionando no scroll para baixo e para cima.
        */
        mensagemSolucoes.classList.toggle(
          "visivel",
          entrada.isIntersecting
        );
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observerSolucoes.observe(secaoSolucoes);
  } else {
    mensagemSolucoes.classList.add("visivel");
  }
}

// ===== DEMAIS SEÇÕES: REVEAL ÚNICO =====

if ("IntersectionObserver" in window) {
  const observerSecoes = new IntersectionObserver(
    (entradas, observador) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  secoes.forEach((secao) => observerSecoes.observe(secao));
} else {
  secoes.forEach((secao) => secao.classList.add("visivel"));
}

// ===== SERVIÇOS: CARD FECHADO + PAINÉIS HORIZONTAIS =====

gtaCards.forEach((card) => {
  const aberto = card.querySelector(".gta-card-aberto");
  const viewport = card.querySelector(".gta-card-viewport");
  const paineisContainer = card.querySelector(".gta-card-paineis");
  const paineis = card.querySelectorAll(".gta-painel");
  const botoesVoltar = card.querySelectorAll(".gta-botao-voltar");
  const barraProgresso = card.querySelector(".gta-progresso-atual");

  if (!aberto || !viewport || !paineisContainer || paineis.length < 2) {
    return;
  }

  let cardAberto = false;
  let painelAtual = 0;
  let acumuladoWheel = 0;
  let wheelBloqueado = false;
  let timeoutWheel;

  function larguraPainel() {
    /*
      getBoundingClientRect mede a largura renderizada real.
      É mais confiável que usar valores fixos em vw no CSS,
      sobretudo após o card ganhar a classe .aberto.
    */
    return viewport.getBoundingClientRect().width;
  }

  function moverParaPainel(indice) {
    const ultimoPainel = paineis.length - 1;
    const indiceSeguro = Math.max(0, Math.min(indice, ultimoPainel));
    const largura = larguraPainel();

    painelAtual = indiceSeguro;

    paineisContainer.style.transform =
      `translate3d(-${painelAtual * largura}px, 0, 0)`;

    card.classList.toggle(
      "no-ultimo-painel",
      painelAtual === ultimoPainel
    );

    /*
      A barra usa o índice atual para mostrar o avanço.
      Se houver 2 painéis, ela vai de 0% para 100%.
    */
    if (barraProgresso) {
      const progresso =
        paineis.length > 1
          ? (painelAtual / (paineis.length - 1)) * 100
          : 0;

      barraProgresso.style.transform =
        `translateX(${progresso}%)`;
    }
  }

  function fecharOutrosCards() {
    gtaCards.forEach((outroCard) => {
      if (outroCard === card) return;

      outroCard.classList.remove("aberto");
      outroCard.classList.remove("no-ultimo-painel");

      outroCard
        .querySelector(".gta-card-aberto")
        ?.setAttribute("aria-hidden", "true");
    });
  }

  function abrirCard() {
    if (cardAberto) return;

    fecharOutrosCards();

    cardAberto = true;
    painelAtual = 0;
    acumuladoWheel = 0;

    card.classList.add("aberto");
    aberto.setAttribute("aria-hidden", "false");

    /*
      Dois frames garantem que o navegador aplicou .aberto
      antes de medir a largura do painel interno.
    */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        moverParaPainel(0);
      });
    });
  }

  function fecharCard() {
    if (!cardAberto) return;

    cardAberto = false;
    painelAtual = 0;
    acumuladoWheel = 0;
    wheelBloqueado = false;

    clearTimeout(timeoutWheel);

    card.classList.remove("aberto");
    card.classList.remove("no-ultimo-painel");
    aberto.setAttribute("aria-hidden", "true");

    requestAnimationFrame(() => {
      moverParaPainel(0);
    });
  }

  function navegar(direcao) {
    moverParaPainel(painelAtual + direcao);
  }

  function controlarWheel(evento) {
    if (!cardAberto) return;

    /*
      Enquanto o card está aberto:
      scroll vertical do mouse/trackpad vira navegação
      horizontal entre os painéis.
    */
    evento.preventDefault();
    evento.stopPropagation();

    const delta = evento.deltaY || evento.deltaX;
    if (!delta) return;

    acumuladoWheel += delta;

    /*
      Threshold evita que um toque minúsculo do trackpad
      avance o painel imediatamente.
    */
    if (Math.abs(acumuladoWheel) < 70 || wheelBloqueado) {
      return;
    }

    wheelBloqueado = true;
    navegar(acumuladoWheel > 0 ? 1 : -1);
    acumuladoWheel = 0;

    timeoutWheel = setTimeout(() => {
      wheelBloqueado = false;
    }, 700);
  }

  // Clique em card fechado abre; clique no último painel fecha.
  card.addEventListener("click", (evento) => {
    /*
      Links e botões não devem abrir/fechar o card.
      O botão Voltar tem sua própria função abaixo.
    */
    if (evento.target.closest("button, a")) return;

    if (!cardAberto) {
      abrirCard();
      return;
    }

    const ultimoPainel = paineis.length - 1;

    if (painelAtual === ultimoPainel) {
      fecharCard();
    }
  });

  // Acessibilidade por teclado.
  card.addEventListener("keydown", (evento) => {
    if (
      !cardAberto &&
      (evento.key === "Enter" || evento.key === " ")
    ) {
      evento.preventDefault();
      abrirCard();
      return;
    }

    if (!cardAberto) return;

    if (evento.key === "ArrowRight") navegar(1);
    if (evento.key === "ArrowLeft") navegar(-1);
    if (evento.key === "Escape") fecharCard();
  });

  // Botão Voltar fecha de qualquer painel.
  botoesVoltar.forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      fecharCard();
    });
  });

  // Captura o scroll só no card aberto.
  card.addEventListener("wheel", controlarWheel, {
    passive: false,
  });

  // Recalcula a posição se a tela for redimensionada.
  window.addEventListener("resize", () => {
    if (cardAberto) {
      moverParaPainel(painelAtual);
    }
  });
});
