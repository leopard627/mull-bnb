const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0ea5e9");
  gradient.addColorStop(0.5, "#06b6d4");
  gradient.addColorStop(1, "#0891b2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle radial gradients for depth
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.8, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.2, 250, 0, Math.PI * 2);
  ctx.fill();

  // Load and draw logo
  try {
    const logoPath = path.join(__dirname, "../public/logo.png");
    const logo = await loadImage(logoPath);

    // Calculate logo dimensions (max width 500, maintain aspect ratio)
    const maxLogoWidth = 500;
    const logoAspect = logo.width / logo.height;
    const logoWidth = maxLogoWidth;
    const logoHeight = logoWidth / logoAspect;

    const logoX = (width - logoWidth) / 2;
    const logoY = (height - logoHeight) / 2 - 60;

    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
  } catch (e) {
    // Fallback: draw text if logo fails
    ctx.fillStyle = "white";
    ctx.font = "bold 120px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mull", width / 2, height / 2 - 40);
  }

  // Subtitle
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.font = "600 42px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BNB Chain Transaction Explainer", width / 2, height / 2 + 80);

  // Feature tags
  const tags = ["Transfers", "Swaps", "Staking", "NFTs", "DeFi"];
  const tagWidth = 100;
  const tagHeight = 36;
  const tagGap = 12;
  const totalTagsWidth = tags.length * tagWidth + (tags.length - 1) * tagGap;
  let tagX = (width - totalTagsWidth) / 2;
  const tagY = height / 2 + 140;

  ctx.font = "500 16px system-ui, sans-serif";
  tags.forEach((tag) => {
    // Tag background
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 20);
    ctx.fill();

    // Tag text
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(tag, tagX + tagWidth / 2, tagY + 24);

    tagX += tagWidth + tagGap;
  });

  // Save to file
  const buffer = canvas.toBuffer("image/png");
  const outputPath = path.join(__dirname, "../public/og-image.png");
  fs.writeFileSync(outputPath, buffer);
  console.log(`OG image saved to ${outputPath}`);

  // Also create Twitter image (same size is fine)
  const twitterOutputPath = path.join(__dirname, "../public/twitter-image.png");
  fs.writeFileSync(twitterOutputPath, buffer);
  console.log(`Twitter image saved to ${twitterOutputPath}`);
}

generateOGImage().catch(console.error);
