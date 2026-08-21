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
