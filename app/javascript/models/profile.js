// javascript/models/profile.js

import { ethers } from "ethers";

export default class Profile {
    constructor(contract) {
        this.contract = contract;
    }

    async getBalance(walletAddress) {
        try {
            let profileBalance = await this.contract.getProfileBalance(walletAddress);
            return ethers.utils.formatEther(profileBalance);
        } catch (error) {
            console.error("Error getting profile balance:", error);
            return null;
        }
    }

    async getCoffees(walletAddress) {
        try {
            return await this.contract.getCoffeeByProfile(walletAddress);
        } catch (error) {
            console.error("Error getting profile coffees:", error);
            return null;
        }
    }
}

