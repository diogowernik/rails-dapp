// javascript/models/ethereum_manager.js

import { ethers } from "ethers";
import abi from "../contract.json" assert { type: "json" };
import { loadNetworkConfig, getCurrentContractAddress } from "../config/network";
import Profile from "./profile_manager";

class EthereumManager {
  constructor() {
    this.walletConnected = false;
    this.userAddress = null;
    this.userBalance = null;
    this.provider = null;
    this.contract = null;
    this.CONTRACT_ABI = abi.abi;
    this.CONTRACT_ADDRESS = null;
    
    this.initialized = this.init();
  }

  async init() {
    try {
        await loadNetworkConfig();
        this.CONTRACT_ADDRESS = getCurrentContractAddress();
        if (!this.CONTRACT_ADDRESS) {
            throw new Error("Contract address is not set.");
        }
        console.log("Contract Address:", this.CONTRACT_ADDRESS); 
        return Promise.resolve(); // Adicione esta linha para resolver a promessa.
    } catch (error) {
        console.error('Erro ao carregar as configurações das redes:', error);
        return Promise.reject(error); // Adicione esta linha para rejeitar a promessa.
    }
}


  async connect() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return this.syncComponents(accounts);
    } 
    return null;
  }

  async connectMetamask() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return this.syncComponents(accounts);
    } else {
      console.log("Please install Metamask");
      return null;
    }
  }

  async syncComponents(accounts) {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    if (accounts.length > 0) {
      this.walletConnected = true;
      this.userAddress = accounts[0];
      await this.setupContract();
      return this.userAddress;
    } else {
      this.walletConnected = false;
      console.log("wallet not connected");
      return null;
    }
  }

  async setupContract() {
    if (!this.CONTRACT_ADDRESS) {
        console.error("Contract address is not set up yet.");
        return;
      }
  
    console.log("Setting up contract with address:", this.CONTRACT_ADDRESS);

    if (this.walletConnected && this.provider) {
      this.contract = new ethers.Contract(
        this.CONTRACT_ADDRESS,
        this.CONTRACT_ABI,
        this.provider.getSigner()
      );
      this.profileInstance = new Profile(this.contract);
    }
  }

  get isConnected() {
    return this.walletConnected;
  }

}

export default EthereumManager;
