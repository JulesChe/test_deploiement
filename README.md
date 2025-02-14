# 🚀 Projet INFO802 - Planification de trajets électriques

## 📌 Description

Ce projet est une application web permettant de simuler des trajets pour véhicules électriques en prenant en compte :

- **L'autonomie du véhicule**
- **Les bornes de recharge disponibles**
- **Le temps total du trajet incluant les recharges**

L'application est déployée sur **Azure App Service** et utilise **Swagger** pour documenter son API.

### **Installation du projet**

```bash
# Cloner le dépôt Git
$ git clone https://github.com/nom-utilisateur/projet-info802.git
$ cd projet-info802

# Installer les dépendances
$ npm install
```

### **Configuration des variables d’environnement**

Créer un fichier `.env` et y ajouter :

CHARGING_STATIONS_API=https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve
ORS_API_KEY=ta_cle_api_ors
PORT=4000

````

---

## 🚀 Lancement du projet en local

```bash
# Démarrer le serveur Express
$ npm start
````

---

- **Site web** : `https://projet-info802.azurewebsites.net`
- **Swagger** : `https://projet-info802.azurewebsites.net/api-docs`

---
