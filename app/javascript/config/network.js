// app/javascript/config/network.js

let networks = {};
let currentNetwork = "goerli"; // padrão inicial

async function loadNetworkConfig() {
    try {
        const response = await fetch('/networks_config');
        networks = await response.json();

        return networks;
    } catch (error) {
        console.error('Erro ao carregar as configurações das redes:', error);
        throw error;
    }
}

function getCurrentContractAddress() {
    if (networks[currentNetwork] && networks[currentNetwork].contracts && networks[currentNetwork].contracts.buymecoffee) {
        return networks[currentNetwork].contracts.buymecoffee.address;
    }
    console.error('Contract address not found in the network configuration.');
    return null;
}


export { loadNetworkConfig, getCurrentContractAddress };


