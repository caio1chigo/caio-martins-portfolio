// ===== EXPANSÃO DOS CARDS DE SERVIÇO =====
const cardsServico = document.querySelectorAll(".servico-card");

cardsServico.forEach((card) => {
  const botao = card.querySelector(".servico-toggle");

  botao.addEventListener("click", () => {
    const cardFoiAberto = card.classList.contains("aberto");

    cardsServico.forEach((outroCard) => {
      outroCard.classList.remove("aberto");

      const outroBotao = outroCard.querySelector(".servico-toggle");
      outroBotao.setAttribute("aria-expanded", "false");
    });

    if (!cardFoiAberto) {
      card.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
    }
  });
});

// ===== ANIMAÇÃO DE ENTRADA DAS SEÇÕES AO ROLAR =====
const secoes = document.querySelectorAll("section");

const entrarNaTela = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visivel");
      observer.unobserve(entry.target);
    }
  });
};

const configObserver = {
  threshold: 0.15,
  rootMargin: "-10% 0px"
};

const observer = new IntersectionObserver(entrarNaTela, configObserver);

secoes.forEach(secao => {
  secao.classList.add("oculta");
  observer.observe(secao);
});
