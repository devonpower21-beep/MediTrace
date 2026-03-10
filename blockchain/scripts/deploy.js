const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying MediTrace contract...");

    const MediTrace = await hre.ethers.getContractFactory("MediTrace");
    const mediTrace = await MediTrace.deploy();

    await mediTrace.waitForDeployment();

    const address = await mediTrace.getAddress();
    console.log("MediTrace deployed to:", address);

    // Save ABI and Address for the frontend
    const artifact = await hre.artifacts.readArtifact("MediTrace");
    const contractData = {
        address: address,
        abi: artifact.abi
    };

    const outputDir = path.join(__dirname, "../../web/lib");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDir, "contractData.json"),
        JSON.stringify(contractData, null, 2)
    );

    console.log("Contract data saved to web/lib/contractData.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
