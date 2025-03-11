
# Configurazione Database MySQL

Questo documento fornisce istruzioni per configurare il database MySQL per l'applicazione Cirelli Inventory Management.

## Prerequisiti

- MySQL Server (versione 5.7 o successiva)
- Un client MySQL (MySQL Workbench, phpMyAdmin, o la CLI di MySQL)

## Passi per l'installazione

1. Accedi al tuo server MySQL:

```bash
mysql -u root -p
```

2. Esegui lo script SQL per creare il database e le tabelle necessarie:

```bash
mysql -u root -p < install.sql
```

In alternativa, puoi aprire il file `install.sql` con un client MySQL e eseguirlo direttamente.

3. Crea un utente dedicato per l'applicazione (opzionale ma consigliato):

```sql
CREATE USER 'cirelli_app'@'localhost' IDENTIFIED BY 'password_sicura';
GRANT ALL PRIVILEGES ON cirelli_inventory.* TO 'cirelli_app'@'localhost';
FLUSH PRIVILEGES;
```

## Configurazione dell'applicazione

Dopo aver configurato il database, assicurati di aggiornare le variabili di ambiente nel file `.env` del server backend:

```
DB_HOST=localhost
DB_USER=cirelli_app
DB_PASSWORD=password_sicura
DB_NAME=cirelli_inventory
```

## Verifica dell'installazione

Per verificare che il database sia configurato correttamente, esegui:

```sql
USE cirelli_inventory;
SHOW TABLES;
SELECT * FROM vehicles LIMIT 5;
```

Dovresti vedere le tabelle create e alcuni dati di esempio.

