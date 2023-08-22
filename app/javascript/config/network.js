// app/javascript/config/network.js

let networks = {};
let currentNetwork = "goerli"; 
let CONTRACT_ADDRESS;

async function loadNetworks() {
  try {
    const response = await fetch('/networks_config');
    networks = await response.json();
    CONTRACT_ADDRESS = networks[currentNetwork].contracts.buymecoffee.address;
    return networks;
  } catch (error) {
    console.error('Erro ao carregar as configurações das redes:', error);
    return null;
  }
}

export { loadNetworks, currentNetwork, CONTRACT_ADDRESS };
