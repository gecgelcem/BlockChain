const hre = require("hardhat");

async function main() {
  const GuntToken = await hre.ethers.getContractFactory("GuntToken");
  const guntToken = await GuntToken.deploy(100000000);

  await guntToken.deployed();

  console.log("Gunt token deployed.", guntToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
