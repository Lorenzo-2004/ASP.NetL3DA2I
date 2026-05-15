# EMIT Scheduler — Backend ASP.NET Web API

## Stack
- **ASP.NET Core 10** (Web API, C#)
- **PostgreSQL** (via EF Core + Npgsql)
- **Swagger** (documentation auto)

---

## 1. Prérequis

```bash
# .NET 10 SDK
https://dotnet.microsoft.com/download/dotnet/8.0

# PostgreSQL installé et démarré
# Créer la base de données :
psql -U postgres -c "CREATE DATABASE emitdb;"
```

---

## 2. Configuration

Modifier `appsettings.json` :
```json
"DefaultConnection": "Host=localhost;Database=emitdb;Username=postgres;Password=LORENZO2004"
```

---

## 3. Migration & démarrage

```bash
cd EmitScheduler.API

# Installer les dépendances
dotnet restore

# Créer la migration initiale
dotnet ef migrations add InitialCreate

# Appliquer la migration (ou laissez Program.cs le faire au démarrage)
dotnet ef database update

# Démarrer le serveur
dotnet run
```

L'API sera disponible sur : **http://localhost:5000**  
Swagger UI : **http://localhost:5000/swagger**

---

## 4. Endpoints disponibles

### Mentions
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/mentions | Liste toutes les mentions |
| GET | /api/mentions/{id} | Détail d'une mention |
| POST | /api/mentions | Créer DA2I, AES, ICM |
| PUT | /api/mentions/{id} | Modifier |
| DELETE | /api/mentions/{id} | Supprimer |

### Niveaux
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/niveaux | Tous les niveaux |
| GET | /api/niveaux/byMention/{mentionId} | Niveaux d'une mention |
| POST | /api/niveaux | Créer L1/L2/L3 pour une mention |

### Salles
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/salles | Toutes les salles |
| POST | /api/salles | Créer (1 salle = 1 niveau) |

### Professeurs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/professeurs | Tous avec leurs mentions et cours |
| POST | /api/professeurs | Créer + assigner mentions/cours |
| PUT | /api/professeurs/{id}/mentions/{mentionId} | Toggle mention |

### Cours
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/cours | Tous les cours |
| POST | /api/cours | Créer un cours (ex: C++) |

### Emploi du Temps ⭐
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/emploidutemps | Tous les créneaux |
| GET | /api/emploidutemps/niveau/{id} | Emploi du temps d'un niveau |
| GET | /api/emploidutemps/professeur/{id} | EDT d'un prof |
| GET | /api/emploidutemps/maintenant | Créneaux en ce moment |
| GET | /api/emploidutemps/disponibilite | **Statut LIBRE/OCCUPE de tout le monde** |
| POST | /api/emploidutemps | Créer un créneau (avec détection de conflit) |

---

## 5. Exemple de données initiales

```json
// POST /api/mentions
{ "code": "DA2I", "nom": "Développement d'Applications et Intelligence Informatique" }
{ "code": "AES", "nom": "Administration Économique et Sociale" }
{ "code": "ICM", "nom": "Informatique et Communication Multimédia" }

// POST /api/niveaux  (pour chaque mention)
{ "code": "L1", "mentionId": 1 }
{ "code": "L2", "mentionId": 1 }
{ "code": "L3", "mentionId": 1 }

// POST /api/cours
{ "intitule": "C++", "description": "Programmation orientée objet en C++" }

// POST /api/emploidutemps
{
  "niveauId": 3,
  "professeurId": 1,
  "coursId": 1,
  "salleId": 3,
  "jour": 1,
  "heureDebut": "08:00",
  "heureFin": "10:00"
}
```

---

## 6. Structure du projet

```
EmitScheduler.API/
├── Controllers/
│   ├── MentionsController.cs
│   ├── NiveauxController.cs
│   ├── ProfesseursController.cs
│   ├── CoursEtSallesController.cs
│   └── EmploiDuTempsController.cs
├── Data/
│   └── AppDbContext.cs
├── DTOs/
│   └── Dtos.cs
├── Models/
│   ├── Mention.cs
│   ├── Niveau.cs
│   ├── Salle.cs
│   ├── Professeur.cs
│   ├── Cours.cs
│   ├── Etudiant.cs
│   ├── EmploiDuTemps.cs
│   └── JoinTables.cs
├── Program.cs
└── appsettings.json
```
