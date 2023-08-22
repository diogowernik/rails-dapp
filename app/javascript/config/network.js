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
    if (networks[currentNetwork]) {
        return networks[currentNetwork].contracts.buymecoffee.address;
    }
    return null;
}

export { loadNetworkConfig, getCurrentContractAddress };


