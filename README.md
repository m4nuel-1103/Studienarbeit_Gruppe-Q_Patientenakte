# Patientenakte

## Über diese Arbeit
In dieser Arbeit wurden die Anwendbarkeit von Distributed Ledger Technologien
zum Schutze der Datenhoheit anhand von einer Patientenakte untersucht. Hierzu
wurden bereits existierenden Technologien evaluiert. Auf diesen Vergleich
aufbauend wurde eine eigene Lösung erarbeitet und prototypisch umgesetzt. Dieser
Prototyp hat den Schutz der Datenhoheit erfolgreich demonstriert.

## Initialisierung

### Pakete installieren

Für die Blockchain:
```bash
cd contracts-test && npm install . && cd ..
```

Für das Backend:
```bash
cd backend && npm install . && cd ..
```

Für das Frontend:
```bash
cd frontend/patientenakte_anwendung && npm install . && cd ../..
```

### Datenbank:
Im Projektverzeichnis:
```bash
docker compose up -d
```

### Einmaliges Setup:

Nach dem Starten der Datenbank:
```bash
cd backend
cp .env.example .env
node ace generate:key
npx drizzle-kit generate
npx drizzle-kit push --url postgresql://backu:example@localhost/app  \
    --dialect postgresql --schema db/schema.ts
cd ..
```

### Starten:

```bash
cd contracts-test
npx hardhat node
```

Danach im `contracts-test` Ordner:
```bash
npx hardhat run --network localhost scripts/deploy.js
cd ..
```
Hier wird eine Adresse gedruckt.
Bei der Test-Chain ist diese beim ersten Mal immer
`0x5FbDB2315678afecb367f032d93F642f64180aa3` (Groß- und Kleinschreibung ist egal).
Wenn diese anders sein sollte, weil noch mal deployt wurde, muss die andere
Adresse in [contractConfig.js](frontend/patientenakte_anwendung/src/contractConfig.ts#L6)
auf den neuen Wert geändert werden.

Wenn gedruckt wird:
```
Compiled 2 Solidity files successfully (evm target: XXX).
```
dann müssen die Kompilation-Artefakte zum Frontend kopiert werden:
```bash
cd contracts-test
cp artifacts/contracts/Patientenakte.sol/Patientenakte.json \
    ../frontend/patientenakte_anwendung/src
cp artifacts/contracts/FabricOfPatientenakte.sol/FabrikPatientenakte.json \
    ../frontend/patientenakte_anwendung/src
cd ..
```
Beachten: im `contracts-test` Ordner sein.

Datenbank starten:
```bash
docker compose start
```

Backend starten:
```bash
cd backend && npm run dev
```

Frontend starten:
```bash
cd frontend/patientenakte_anwendung && npm run dev
```

### Beispiel Daten:
Wenn die Lokale Test-Chain benutzt wird, können folgende Befehle benutzt
werden, um Test-Patienten und Doktoren in der Datenbank anzulegen:
```bash
curl http://localhost:3000/patients -X 'POST' \
    --data '{
        "id": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "name": "Amanda",
        "diagnosis": "Krebs",
        "city": "Berlin",
        "gender": "w",
        "birthdate": "1998-01-03"
    }' \
    -H 'Content-Type: application/json'
curl http://localhost:3000/doctors -X 'POST' \
    --data '{
        "id": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "name": "dr. Sepp"
    }' \
    -H 'Content-Type: application/json'
curl http://localhost:3000/patients -X 'POST' \
    --data '{
        "id": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "name": "Sepp",
        "diagnosis": "Frakturen am Unterarm",
        "city": "Karlsruhe",
        "gender": "m",
        "birthdate": "2000-05-11"
    }' \
    -H 'Content-Type: application/json'
```
Wenn zusätzliche Patienten oder Doktoren angelegt werden, muss darauf geachtet
werden, dass alle Buchstaben der Adresse kleingeschrieben sind, da sonst mehrere Vergleiche scheitern.

### Mögliche Fehler:
Sind die Ports 5432 (Datenbank), 8545 (Test-Chain), 3000 (Backend) und 5173 (Frontend) frei?

Wenn die Blockchain neu gestartet wird, müssen auf Chromium-basierten Browsern
entweder den Browser neu starten werden oder Metamask ausschalten und wieder
einschalten werden, für Firefox-basierte Browser funktioniert ein Browserneustart nicht.

Bevor sie bei der Blockchain den nicht deployt haben, können sie
keine Patientenakte erstellen.
