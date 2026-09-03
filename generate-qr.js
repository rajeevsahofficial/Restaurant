
import QRCode from "qrcode";

const website = "http://admitbridge.in";

for (let table = 1; table <= 3; table++) {
  const url = `${website}/?table=${table}`;

  await QRCode.toFile(`table-${table}.png`, url, {
    width: 1000,
    margin: 2,
  });

  console.log(`Generated QR for Table ${table}`);
}