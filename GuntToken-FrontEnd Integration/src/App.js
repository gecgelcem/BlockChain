import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import faucetContract from "./ethereum/faucet";
import faucetCotract from "./ethereum/faucet";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setFcContract] = useState();
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [transactionData, setTransactionData] = useState("");
  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /*Get Provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /*Get Accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        /* Get Signer*/
        setSigner(provider.getSigner());
        /*Local contract instance*/
        setFcContract(faucetCotract(provider));

        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /*Get Provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /*Get Accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          /* Get Signer*/
          setSigner(provider.getSigner());
          /*Local contract instance*/
          setFcContract(faucetCotract(provider));
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const getGUNTHandler = async () => {
    setWithdrawError("");
    setWithdrawSuccess("");
    try {
      const fcContractWithSigner = fcContract.connect(signer);
      const response = await fcContractWithSigner.requestTokens();
      console.log(response);
      setWithdrawSuccess("Valid Operation!-Thx for using GUNT!");
      setTransactionData(response.hash);
    } catch (err) {
      console.error(err.message);
      setWithdrawError(err.message);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">Gunt Token (GUNT)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Doge Faucet</h1>
            <p>Rapid and Cute. 50 GUNT/hour.</p>
            <p>This DApp runs on ETH Goerli TestNet</p>
            <div className="token-addr">
              Token Contract
              Addr:0x54a593df44a9d023590c9d2d5a79e562e09667389ae40a77aeb532d70b20a58d
            </div>
            <div className="mt-5">
              {withdrawError && (
                <div className="withdraw-error">{withdrawError}</div>
              )}
            </div>
            <div className="mt-5">
              {withdrawError && (
                <div className="withdraw-success">{withdrawSuccess}</div>
              )}
              {"   "}
              <div className="box address-box">
                <div className="columns">
                  <div className="column is-four-fifths">
                    <input
                      className="input is-medium"
                      type="text"
                      placeholder="Enter your wallet address (0x...)"
                      defaultValue={walletAddress}
                    />
                  </div>
                  <div className="column">
                    <button
                      className="button is-link is-medium"
                      onClick={getGUNTHandler}
                      disabled={walletAddress ? false : true}
                    >
                      GET TOKENS
                    </button>
                  </div>
                </div>
                <article className="panel is-grey-darker">
                  <p className="panel-heading">Transaction Data</p>
                  <div className="panel-block">
                    <p>
                      {transactionData
                        ? `Transaction hash: ${transactionData}`
                        : "--"}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
