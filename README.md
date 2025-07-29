# 🐾 PawsHaven – Pet Adoption Platform

Welcome to **PawsHaven**, a full‑stack pet adoption platform connecting adopters with pets, shelters, and pet‑owners, built with Java Spring Boot backend and React frontend.
(UI screenshots are included at the end of the README.md file)
---

## 🌟 Key Features

###  Pet Listings & Profiles
- Registered users and shelters can **submit pets** for adoption via a form.
- Each pet profile includes **photos**, breed, age, description, medical info, and more.
- Once submitted, users can **track** the adoption **admin decision** through their profile.

###  Predictive Adoption Time
- After a pet submission, the system **predicts** how long it will take for that pet to be adopted based on data‑driven analysis.

### Favorites & User Profiles
- Users can **favorite** pets and revisit them via:
  - `My Favorites`
  - `My Submitted Pets`
- Accessible from the **User Profile** dashboard after login.

### Chatbot & Messaging
- Built‑in **chatbot assistant** helps users navigate the site and get answers.
- Additionally, registered users can **chat directly with pet owners** to ask questions before adopting.

###  Pet Match Quiz
- A **pet‑match quiz** helps users find the ideal pet based on their lifestyle and preferences.
- Quiz results recommend the best‑fit pets from the listings.

###  Nearby Vet Hospitals Map
- Interactive **map integration** shows **nearby veterinary hospitals** with essential details (address, contact, hours).
- Users can access this map from the site menu.

---

## 🧩 Architecture & Code Structure

### Backend (Java / Spring Boot)

- Controllers manage endpoints for pets, quiz, chat, favorites, user profile, adoption tracking, vet data.
- Services handle quiz scoring, prediction engine, messaging logic.
- Repositories interact with the database (e.g. MySQL).
- Entities include **User**, **Pet**, **Favorite**, **ChatMessage**, **VetHospital**, **AdoptionApplication**.

### Frontend (React.js)

- Clean responsive UI built with React.
- UX includes pet browsing, quiz, chat, profile & submission flows.
- Interactive map powered by an API (e.g. Google Maps, Mapbox).

## 📋 Feature Flow & UX

1. **Browse Pets** – View cards of available pets with filtering options.
2. **Quiz Match** – Take a quiz to find best‑matched pets personalized to user preferences.
3. **Submit a Pet** – Fill in pet information and submit for adoption listing.
4. **Prediction Engine** – After submission, the **predicted adoption time** is calculated and displayed.
5. **Track Decisions** – Submitters can view adoption status (Pending, Approved, Declined) via their profile.
6. **Favorites** – Users can favorite pets and revisit them in their profile.
7. **Chat & Chatbot**:
   - Use the **chatbot** to get quick guidance and pet recommendations.
   - Open direct chat with a **pet owner** to ask questions before adoption.
8. **Vet Hospital Map** – Access a map to find **nearby veterinary clinics**, click to view details like contact info and distance.

---

---

## 🛠️ Admin Panel

The **Admin Panel** of PawsHaven provides privileged access for administrators to manage the overall platform effectively. It allows them to oversee pet submissions, user interactions, and maintain the quality and integrity of the platform.

###  Access
The admin panel is protected and accessible only to authorized admin users.

###  Features Overview

#### 1. **Dashboard Overview**
- Displays real-time statistics such as:
  - Number of pets submitted
  - Approved vs. pending adoptions
  - Number of registered users
  - Adoption success rate

#### 2. **Manage Pet Submissions**
- View all pets submitted for adoption.
- Approve or reject pet requests.
- Update pet information if necessary.
- Filter submissions by status (Pending, Approved, Rejected).

#### 3. **User Management**
- View a list of all registered users.

#### 4. **Contact Messages Management**
- View and respond to **contact form submissions** sent by users.
- Mark messages as read or resolved.

#### 5. **Manage Species (Pet Categories)**
- Add or remove **species** such as Dog, Cat, Rabbit, etc.
- Useful for filtering and quiz matching.


---

## 🧪 Technologies Used

- **Backend**: Java, Spring Boot, Spring Data JPA, Predictive ML module
- **Frontend**: React.js, context API/hooks, Map integration 
- **Database**: MySQL (via Spring Data)
- **Authentication**: JWT , session-based with roles
- **Chat**: WebSocket 

---

## 🧠 Additional Notes

- The **chatbot** can be configured to answer FAQs, help with search, quiz suggestions, or adoption guidance.
- The **prediction logic** uses previous adoption durations and pet metadata (breed, age, health) to estimate how quickly a new submission might get adopted.
- Admins and pet-owners are notified (via email) when chat messages arrive, decisions are made, or predictions update.


---



*Enjoy exploring and supporting PawsHaven!* 🐶🐱

---

## 📸 User Interface (UI) Previews

Explore key parts of the application through visuals below.

### Home Page
![Home Page](https://github.com/samiho03/PawsHaven-Pet-Adoption/blob/main/images/HomePage-Paws.png)

### Pet Profile

![Pet-Profile](https://github.com/samiho03/PawsHaven-Pet-Adoption/blob/main/images/pet-detail.png)
