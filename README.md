# PWA LittleChef

Die vorliegende Progressive Web App wurde mittels Vite, Vue 3 (inkl. Pinia und Vue Router) und Firebase umgesetzt.
Die App erfüllt die PWA-Standards (Bemerkungen dazu, jeweils nachzulesen im ON24-4:T6 Planungsdokument / “App-Steckbrief”).

## Weitere Hinweise zur App:

Zu Beginn des Projekts wurden die Firebase-Zugangsdaten fälschlicherweise direkt in das Git-Repository hochgeladen.
Nachdem wir das Sicherheitsrisiko erkannt haben, wurde dies korrigiert:

Die Daten wurden in eine .env Datei ausgelagert.
Die .env-Datei wurde in die .gitignore aufgenommen. → Die Zugangsdaten werden nun separat mitgeliefert,
damit die App lokal lauffähig bleibt, ohne Keys öffentlich zu exponieren.
Die API-Keys in Firebase wurden in der Google Konsole so eingeschränkt, dass sie nur von der autorisierten
Domain der App genutzt werden können.

Sollte das Git Repository (https://github.com/on24hb/t6-rezeptapp.git) geklont werden, muss manuell
eine .env Datei ergänzt werden (wird zur Prüfung in einem seperaten Dokument mitgeliefert.)

## Befehle zum Starten der Anwendung manuell in VS Code:

npm install
npm run build
npm run preview

oder alternativ (Entwicklungsmodus):
npm install
npm run dev

In der Firebase Konsole wurden zudem Regeln für die Datenbank sowie den Storage festgelegt,
damit nur authentifizierte Nutzer Zugriff auf die Daten haben. Für den Storage wurde zudem die Dateiuploadgröße
auf 7MB beschränkt (könnte vermutlich noch weiter heruntergesetzt werden).

### Für technische Dokumentation siehe Vortragsmaterialien.
