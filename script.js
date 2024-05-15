const cardsContainer = document.getElementById("cards-container");

function getApiData() {
  const banks = [];

  fetch("https://data.directory.openbankingbrasil.org.br/participants")
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length) {
        cardsContainer.innerHTML = "";

        for (let i = 0; i < data.length; i++) {
          const bank = {};
          bank.registeredName = data[i].RegisteredName;
          const authorisationServers = data[i].AuthorisationServers;

          bank.endpoints = [];

          const card = document.createElement("div");
          card.classList.add("card");

          const registeredName = document.createElement("h3");
          registeredName.textContent = bank.registeredName;
          card.appendChild(registeredName);

          banks.push(bank);

          const linhaHori = document.createElement("hr");
          card.appendChild(linhaHori);

          let listaEndPoints = "";
          if (bank.endpoints.length > 0) {
            listaEndPoints += "<ul>";
            for (let j = 0; j < bank.endpoints.length; j++) {
              listaEndPoints += "<li>" + bank.endpoints[j] + "</li>";
            }
            listaEndPoints += "</ul>";
          }

          let bodyModal = "";

          // Percorre todos authorisationServers
          for (let j = 0; j < authorisationServers.length; j++) {
            let logoSrc = null;
            if (authorisationServers[j].CustomerFriendlyLogoUri) {
              logoSrc = authorisationServers[j].CustomerFriendlyLogoUri;

              if (j > 0) {
                bodyModal += "<hr />";
              }

              bodyModal += `<img src="${logoSrc}">`;
              bodyModal += `<h2>${authorisationServers[j].CustomerFriendlyName}</h2>`;
              bank.logoSrc += logoSrc;

              // Percorre todas ApiResources
              const apiResources = authorisationServers[j].ApiResources;
              bodyModal += "<ul>";
              for (let k = 0; k < apiResources.length; k++) {
                const apiDiscoveryEndpoints =
                  apiResources[k].ApiDiscoveryEndpoints;
                for (let l = 0; l < apiDiscoveryEndpoints.length; l++) {
                  if (apiDiscoveryEndpoints[l].ApiEndpoint) {
                    bodyModal += `<li>${apiDiscoveryEndpoints[l].ApiEndpoint}</li>`;
                  }
                }
              }
              bodyModal += "</ul>";
            }
          }

          let modal = `
          <div class="modal fade" id="myModal-${i}" role="dialog">
          <div class="modal-dialog">
          
            <!-- Modal content-->
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Authorization Servers</h4>
              </div>
              <div class="modal-body">
                ${bodyModal}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
            </div>
            
          </div>
          `;
          let modalElement = document.createElement("div");
          modalElement.innerHTML = modal.trim();

          card.appendChild(modalElement);

          let botao = document.createElement("button");
          botao.classList = "btn btn-warning";
          botao.setAttribute("data-target", "#myModal-" + i);
          botao.setAttribute("data-toggle", "modal");

          let textoBotao = document.createTextNode("Ver Authorization Servers");
          botao.appendChild(textoBotao);
          card.appendChild(botao);

          cardsContainer.appendChild(card);

          document
            .querySelectorAll(`#myModal-${i} img`)
            .forEach(function (img) {
              img.onerror = function () {
                this.src =
                  "https://cdn-icons-png.flaticon.com/512/6928/6928929.png";
              };
            });
        }
      } else {
        console.log("Nenhum dado encontrado.");
      }
    });

  function insertDados() {

    const stringBanks = banks.map((bank) => ({
      registeredName: bank.registeredName || "",
      endpoints: bank.endpoints ? bank.endpoints.join() : "",
      logoSrc: bank.logoSrc || "",
    }));

    fetch("http://localhost:8800/insert", {
      method: "POST",
      body: JSON.stringify(stringBanks),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Erro ao fazer a solicitação.");
        }
      })
      .then((dados) => {
        console.log(dados);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  setTimeout(() => {
    insertDados();
  }, 1000);

  setInterval(insertDados, 60 * 60 * 1000);

}

getApiData();

setInterval(getApiData, 60 * 60 * 1000);
