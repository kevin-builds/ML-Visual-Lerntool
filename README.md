# ML-Visualisierungstool

Ein interaktives Lernwerkzeug, das die einfache lineare Regression und den
Gradientenabstieg sichtbar macht. Statt nur das Endergebnis zu zeigen, läuft
das Verfahren Schritt für Schritt ab und lässt sich an jeder Stelle anhalten,
zurückspulen und mit anderen Parametern erneut starten.

Entstanden als Praxisarbeit 2 im Studiengang Künstliche Intelligenz –
Maschine Learning an der DHBW Mannheim.

## Was das Werkzeug zeigt

- **Streudiagramm** mit Datenpunkten und der aktuellen Regressionsgeraden
- **Residuen als Quadrate**, deren Fläche dem Fehleranteil eines Punktes entspricht
- **Fehlerverlauf** des mittleren quadratischen Fehlers über alle Iterationen
- **Kostenlandschaft** als Höhenlinien mit dem tatsächlichen Abstiegspfad
- **Wirkung der Lernrate** als Querschnitt durch die Kostenfunktion
- **Modellvergleich**, der zwei Lernraten gleichzeitig nebeneinander laufen lässt

Die Lernrate ist über einen Regler von 0,001 bis 1,2 einstellbar. Der Ablauf
lässt sich starten, pausieren, einzeln vor- und zurückschalten und in vier
Geschwindigkeiten abspielen. Zu jeder Kennzahl und jedem Diagramm gibt es ein
Info-Symbol mit einer Erklärung.

## Installation

Vorausgesetzt wird Python 3.13. Ob es installiert ist, prüft unter Windows

```
py -3.13 --version
```

Danach das Projekt holen und eine virtuelle Umgebung anlegen:

```
git clone https://github.com/kevin-builds/ML-Visual-Lerntool.git
cd ML-Visual-Lerntool
py -3.13 -m venv .venv
```

Abhängigkeiten installieren:

```
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Unter macOS und Linux heißen die beiden letzten Befehle

```
python3.13 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

## Starten

```
.venv\Scripts\python.exe server.py
```

Der Server läuft danach auf <http://127.0.0.1:8000>. Die Adresse im Browser
öffnen, mehr ist nicht nötig. Beendet wird er im Terminal mit `Strg + C`.

## Eigene Daten verwenden

Vier Beispieldatensätze sind eingebaut, darunter einer mit Ausreißern.
Zusätzlich lässt sich eine eigene CSV-Datei per Klick oder Ziehen in das
Feld in der linken Spalte laden. Dafür gelten folgende Regeln:

- **Genau zwei Spalten.** Die erste ist die Eingabegröße, die zweite der
  Zielwert. Weitere Spalten werden abgewiesen.
- **Mindestens zwei Datenpunkte**, und die x-Werte dürfen nicht alle gleich
  sein, sonst gibt es keine eindeutige Gerade.
- **Nur Zahlen** in den Werten. Text oder leere Felder führen zu einer Meldung.
- **Höchstens 2 MB** je Datei.

Eine Kopfzeile mit Spaltennamen ist erlaubt, aber nicht nötig. Fehlt sie,
werden die Zeilen trotzdem vollständig gelesen. Erkannt werden Komma,
Semikolon und Tabulator als Trennzeichen, Punkt und Komma als Dezimalzeichen
sowie die Kodierungen UTF-8 und Windows-1252. Eine aus Excel exportierte
Datei funktioniert also unverändert.

## Aufbau

```
server.py              Flask-Routen und JSON-Schnittstelle
serialization.py       Umwandlung der Ergebnisse nach JSON
model/                 Rechenkern, kennt weder Webserver noch Oberfläche
  linear_regression.py Modellgleichung, Residuen, Fehler
  gradient_descent.py  Iterationsschleife und Abbruchbedingungen
  scaling.py           Standardisierung und Rücktransformation
  ols.py               Methode der kleinsten Quadrate als Vergleichsmaßstab
data/                  Einlesen, Prüfen und Aufteilen der Daten
templates/             HTML mit Jinja-Bausteinen
static/                CSS und JavaScript-Module, Diagramme mit Plotly
test/                  Vergleich von Gradientenabstieg und OLS
reference/             eigenständiges Minimalbeispiel ohne Weboberfläche
```

Der gesamte Verlauf des Gradientenabstiegs wird beim Start einer Berechnung
einmal vollständig ermittelt und an den Browser übertragen. Das Springen
zwischen Iterationen ist dadurch reines Indexieren in einem Array und
braucht keine weitere Serveranfrage.

## Ergebnisse prüfen

Das Skript im Ordner `test` rechnet dieselben Datensätze mit dem
Gradientenabstieg und mit der Methode der kleinsten Quadrate und stellt die
Steigungen gegenüber:

```
.venv\Scripts\python.exe test\compare_ols_gradient.py
```

Beide Verfahren stimmen auf allen vier Beispieldatensätzen bis auf eine
relative Abweichung von rund 4,7 · 10⁻⁶ überein.

## Bekannte Grenzen

Umgesetzt ist ausschließlich die einfache lineare Regression mit einer
Eingabegröße. Multiple Regression, andere Verfahren und eine im Werkzeug
bearbeitbare Datentabelle sind nicht enthalten. Automatisierte Tests gibt es
über den oben genannten Vergleich hinaus nicht. Das Werkzeug ist als
didaktisches Hilfsmittel gedacht und nicht für große Datenmengen ausgelegt.
