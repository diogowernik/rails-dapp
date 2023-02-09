import { Controller } from "@hotwired/stimulus";
import { ethers } from "ethers";

// variables to store data
let walletConnected = false;
let userAddress = null;
let userBalance = null;
let provider = null;

// contract on goerli that i deployed 0x5CFE10e919EE71274c971512514C94BfA78C923a

// Connects to data-controller="metamask"
export default class extends Controller {
  static targets = [
    "connect",
    "wallet",
    "results",
    "form",
    "address",
    "balance",
  ];

  connect() {
    this.isWalletConnected();
  }

  async isWalletConnected() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      this.syncComponents(accounts);
    } 
  }
  
  async connectMetamask() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.syncComponents(accounts);
    } else {
      console.log("Please install Metamask");
    }
  }

  async syncComponents(accounts) {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    if (accounts.length > 0) {
      walletConnected = true;
      userAddress = accounts[0];
      console.log("your account address is: " + accounts[0]);
      // hide connect button
      this.connectTarget.hidden = true;
      // show elements
      this.walletTarget.hidden = false;
      this.resultsTarget.hidden = false;
      this.formTarget.hidden = false;

      this.addressTarget.innerText = `${userAddress.slice(
        0,
        6
      )}...${userAddress.slice(-3)}`.toUpperCase(); 
      
      userBalance = await provider.getBalance(userAddress);
      userBalance = ethers.utils.formatEther(userBalance);
      this.balanceTarget.innerText = Math.round(userBalance * 10000) / 10000;
      console.log("your balance is: " + userBalance + " ETH")
      


      // metamask event: reload page if account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        window.location.reload();
      });

    } else {
      walletConnected = false;
      console.log("wallet not connected");
      // show connect button
      this.connectTarget.hidden = false;
      // hide elements
      this.walletTarget.hidden = true;
      this.resultsTarget.hidden = true;
      this.formTarget.hidden = true;
      this.addressTarget.innerText = "";
    }
  }

}
