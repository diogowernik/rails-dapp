import { Controller } from "@hotwired/stimulus";
import { ethers } from "ethers";
import abi from "../contract.json" assert { type: "json" };

// contract on goerli that i deployed 0x5CFE10e919EE71274c971512514C94BfA78C923a
// new contract on golerli 0x4857CF33924d60614b144D11d5c22EeF766895D8
const CONTRACT_ADDRESS = "0x4857CF33924d60614b144D11d5c22EeF766895D8";
const CONTRACT_ABI = abi.abi;

// variables to store data
let walletConnected = false;
let userAddress = null;
let userBalance = null;
let provider = null;
let contract = null;
let transactions = [];

// Connects to data-controller="metamask"
export default class extends Controller {
  static targets = [
    "connect",
    "wallet",
    "results",
    "form",
    "address",
    "balance",
    "name",
    "message",
    "price",
    "notification",
    "transactionTemplate",
    "withdraw",
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

  async setupContract() {
    if (walletConnected && provider) {
      contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider.getSigner()
      );

      // Check if the current user is the contract's owner or not
      const contractOwner = await contract.owner();
      const userAddress = await provider.getSigner().getAddress();
      
      
      const isOwner = contractOwner === userAddress;
    
        

      console.log("isOwner: ", isOwner);

      if (isOwner) {
        await this.getContractBalance();
        this.withdrawTarget.hidden = false;
      }

      console.log("Contract is set up successfully", contract);
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

      await this.setupContract();
      
      // Fetch all cofee in the blockchain
      this.getAllCoffee();


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

  async showNotification(title, message) {
    const item = this.notificationTarget;
    item.querySelector(".type").innerText = title;
    item.querySelector(".message").innerText = message; 
    this.notificationTarget.hidden = false;
  }

  async buyCoffee() {
    try {
      const name = this.nameTarget.value;
      const message = this.messageTarget.value;
      // get price from button text
      const price = this.priceTarget.innerText;
      // execute transaction
      const transaction = await contract.buyCoffee(
        name ? name : "Anonymous", 
        message ? message : "Enjoy your coffee!", 
        {value: ethers.utils.parseEther(price)}
        );

      // Disable form
      this.formTarget.classList.add("pointer-events-none");

      // Show notification
      this.showNotification("Processing...", "We are almost there.");

      // console.log("Processing...", transaction.hash);
      await transaction.wait();
      // alert("Transaction successful!");
      this.showNotification("Success", "Your coffee is on its way!");

      // reload the whole page
      window.location.reload();
    }
    catch (error) {
      console.log(error);
      alert("Transaction failed!");
    }
  }

  async getAllCoffee() {
    try {
      transactions = await contract.getAllCoffees();
      console.log(transactions);

      this.resultsTarget.innerText = "";
      transactions
        .slice(0)
        .reverse()
        .map((txn) => {
          this.addResultItem(txn);
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  async getContractBalance() {
    try {
      let contractBalance = await contract.getBalance();
      contractBalance = ethers.utils.formatEther(contractBalance);
      contractBalance = Math.round(contractBalance * 10000) / 10000;

      // console.log("Contract's balance: ", contractBalance);

      if (contractBalance > 0) {
        this.withdrawTarget.innerText = `Withdraw ${contractBalance} ETH`;
      } else {
        this.withdrawTarget.disabled = true;
        this.withdrawTarget.innerText = "No fund to withdraw";
      }
    } catch (error) {
      console.log(error);
    }
  }

  async withdraw() {
    try {
      const transaction = await contract.withdraw();

      // Disable the withdraw button
      // ...

      // Show notification
      this.showNotification("Transferring fund...", "Please be patience!");
      console.log("Transferring...", transaction.hash);

      await transaction.wait();

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  addResultItem(txn) {
    const item =
      this.transactionTemplateTarget.content.firstElementChild.cloneNode(true);

    const tx_eth = ethers.utils.formatEther(txn.amount);
    const tx_address = `${txn.supporter.slice(0, 6)}...${txn.supporter.slice(
      -3
    )}`.toUpperCase();
    const tx_date = new Date(txn.timestamp.toNumber() * 1000).toLocaleString(
      "en-US"
    );

    item.querySelector(".supporter").innerText = txn.name;
    item.querySelector(".message").innerText = txn.message;
    item.querySelector(".price").innerText = `supported ${tx_eth} ETH`;
    item.querySelector(".address").innerText = tx_address;
    item.querySelector(".timestamp").innerText = tx_date;

    this.resultsTarget.append(item);
  }


}
