# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | **Français** | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md)

Extension Chrome Manifest V3 facultative pour Yin-Panel. Elle récupère les octets réels des favicons des sites pour les imports de signets lorsque les requêtes normales du navigateur sont bloquées par CORS, se rabat sur des services publics de favicons et ajoute une redirection configurable des nouveaux onglets. Yin-Panel continue de fonctionner sans elle grâce à ses propres favicons côté serveur et à ses solutions de repli en icônes textuelles.

## Installation

1. Ouvrez `chrome://extensions`.
2. Activez le mode développeur.
3. Choisissez **Load unpacked** et sélectionnez ce répertoire.
4. Rechargez Yin-Panel avant de lancer un import de signets.

## Autorisations

- `storage` — stocke l'URL cible des nouveaux onglets.
- `host_permissions: ["<all_urls>"]` — l'extension demande directement les données de favicon aux sites de signets.
- Aucune autorisation liée à la caméra, au microphone, à la localisation, aux notifications ou aux appareils n'est demandée.

## Redirection des nouveaux onglets

`chrome_url_overrides` envoie chaque nouvel onglet vers `newtab.html`, qui redirige immédiatement vers la cible stockée. La valeur par défaut est `https://panel.yiniot.com`, et seules les URL `http` et `https` sont acceptées ; les valeurs invalides ou absentes reviennent à la valeur par défaut. Définissez la cible depuis la fenêtre contextuelle de la barre d'outils ou la page d'options.

## Récupération des favicons

- Le script de contenu ne répond qu'aux messages marqués `source: 'yin-panel'` et prend en charge les types de messages `ping` et `fetch-icons`.
- Pour chaque page, le service worker suit d'abord les déclarations d'icônes du site lui-même (`rel="icon"`, `apple-touch-icon`, `mask-icon`), puis les chemins de favicon courants à la racine.
- En cas d'échec, il sonde les services publics de favicons, en créant un pool de huit requêtes pour chaque service utilisable.
- Les recherches infructueuses sont renvoyées à Yin-Panel, qui applique ses propres solutions de repli en favicon et en icône textuelle ; l'extension ne génère pas d'icône de repli distincte.

## Langues

L’interface suit la langue de l’interface du navigateur. Les textes en anglais, chinois simplifié, chinois traditionnel, japonais, coréen, allemand, français, espagnol, portugais du Brésil et russe se trouvent dans `_locales/` ; toute autre langue de navigateur revient à l’anglais. Les textes des pages de l’extension sont résolus via `i18n.js` et ne sont jamais codés en dur.

## Développement

| Fichier | Rôle |
| --- | --- |
| `service-worker.js` | Messages de l'extension, récupération des favicons des sites et solutions de repli publiques |
| `content-script.js` | Passerelle de messages côté page utilisée par Yin-Panel |
| `config.js` | Normalisation de l'URL des nouveaux onglets et cible par défaut |
| `newtab.html`, `newtab.js` | Remplacement et redirection des nouveaux onglets |
| `settings.html`, `settings.css`, `settings.js` | Page d'options et fenêtre contextuelle de la barre d'outils |
| `i18n.js`, `_locales/` | Assistant partagé de localisation de page et catalogues de messages par langue |
| `manifest.json` | Autorisations, points d'entrée, remplacement des nouveaux onglets et enregistrement du script de contenu |

Il n'y a aucune étape de build ; chaque fichier est chargé directement. Vérifiez le JavaScript et le manifeste avec :

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) documente les invariants de comportement, le placement des tests et les règles de sécurité. Les tests d'acceptation au niveau du navigateur se trouvent dans le [dépôt E2E](https://github.com/yinorg/yin-panel-e2e) ; le service Core se trouve dans [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Publication automatique sur le Chrome Web Store

Le workflow `.github/workflows/publish-chrome-web-store.yml` s'exécute lorsqu'une balise de version est poussée. Il construit un paquet temporaire, définit la version du manifeste du paquet à partir de la balise, l'envoie via Chrome Web Store API v2 et le soumet pour examen.

Chrome accepte de un à quatre segments de version numériques séparés par des points ; les balises doivent donc ressembler à `1.2.3` ou `v1.2.3`. Le `v` initial facultatif est supprimé avant l'écriture de la version du manifeste. Chaque segment doit être compris entre `0` et `65535`, et la version doit être supérieure à la version actuellement publiée.

### Configuration initiale

1. Activez l'API Chrome Web Store dans un projet Google Cloud.
2. Créez un compte de service Google Cloud et ajoutez son adresse e-mail dans les paramètres du compte du Chrome Web Store Developer Dashboard. Consultez le [guide des comptes de service du Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configurez GitHub Actions Workload Identity Federation pour ce dépôt. Le [guide d'authentification GitHub Actions de Google](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) décrit le pool, le fournisseur et la liaison IAM requis.
4. Ajoutez ces secrets de dépôt :

   - `GCP_WORKLOAD_IDENTITY_PROVIDER` : le nom de ressource complet du fournisseur, par exemple `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT` : l'adresse e-mail du compte de service.
   - `CHROME_WEBSTORE_PUBLISHER_ID` : l'ID de l'éditeur issu du Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID` : l'ID de 32 caractères de cette extension publiée.

Par exemple, publiez la version `1.0.1` avec :

```sh
git tag v1.0.1
git push origin v1.0.1
```

Le workflow soumet la version automatiquement, mais l'examen du Chrome Web Store peut retarder le moment où la nouvelle version devient disponible pour les utilisateurs.
