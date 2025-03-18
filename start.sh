docker compose up
cd ./contracts-test || exit
npm install .
npx hardhat node
npx hardhat run --network localhost scripts/deploy.js
cd ..
cd ./backend || exit
npm install .
npx drizzle-kit generate
npx drizzle-kit push --url postgresql://backu:example@localhost/app  --dialect postgresql --schema db/schema.ts
npm run dev
cd ..
cd ./frontend/patientenakte_anwendung || exit
npm install .
npm run dev
cd ../..
