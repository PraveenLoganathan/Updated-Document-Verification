import Web3 from "web3";
import docVerificationArtifact from "../../build/contracts/DocVerification.json";

const App = {

  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = docVerificationArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        docVerificationArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];


    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setSigner: function(message){
    const signer = document.getElementById("signer");
    signature.innerHTML = "The message was signed by: " + message;
  },

  // signDetails is used to hash message input parameters
  // The hashed message is signed using Metamask
  // The hashed message and signature are displayed in their respective fields

  signDetails: async function() {

    const authorName = document.getElementById("authorName").value;
    const researchTitle = document.getElementById("researchTitle").value;
    const email = document.getElementById("email").value;

    let message = authorName + researchTitle + email;
    const hashedMessage = Web3.utils.sha3(message);
    console.log({ hashedMessage });

    const signature = await ethereum.request({
      method: "personal_sign",
      params: [hashedMessage, this.account],
    });
    console.log({ signature });

    // The below function registers the data in the smart contract.

    const { addNewDoc } = this.meta.methods;

    await addNewDoc(signature, hashedMessage, authorName, researchTitle, email).send({from: this.account});

    document.getElementById('hashedMessage').value = hashedMessage;
    document.getElementById('signature').value = signature;
  },


  // The DApp retrieves hashed message and signature from their respective fields
  // This function will be enchanced in the future to read hashed message and signature from the smart contract

  // verifySig breaks down the signature into v,r and s (this takes place off-chain)
  // DApp calls smart contract's verifyMessage function upon which (the verification takes place on-chain)

  // Metamask prompts user to confirm the transaction

  verifySig: async function() {

    const hashedMessage = document.getElementById('hashedMessage').value;
    const signature = document.getElementById('signature').value;

    console.log(signature);
    console.log(hashedMessage);

    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);
    console.log({ r, s, v });

  // smart contract is supplied with signature parameters and the output is a JSON that contains the signer address ("from:")
    const { VerifyMessage } = this.meta.methods;
    const response = await VerifyMessage(hashedMessage,v,r,s).send({from: this.account});
    console.log(response);

  },

  // getDocumentDetailsFromHash uses the hashed message to pull the document details from the smart contract and the output is a JSON

  getDocumentDetailsFromHash: async function() {
    const hashedMessage = document.getElementById('hashedMessage').value;
    const { getDocDetailsFromHash } = this.meta.methods;
    const details = await getDocDetailsFromHash(hashedMessage).call();
    console.log(details);
  }

};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();

});
