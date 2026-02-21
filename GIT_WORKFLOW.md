# 📌 Team Workflow Instructions

To keep our project stable, **do NOT push directly to the `main` branch**.

All changes must go through **personal branches + Pull Requests (PR).**

---

## 🔹 Step 1: Clone the Repository (first time only)

```bash
git clone https://github.com/sanjayparivallal/Public-Transport-Information-and-Crowd-Insights.git
cd Public-Transport-Information-and-Crowd-Insights
```

---

## 🔹 Step 2: Create Your Personal Branch

Each teammate must create a branch using **their own name**.

```bash
git checkout -b yourName
```

### ✅ Examples

* `sanjay`
* `arun`
* `priya`
* `jamel`

Push it:

```bash
git push origin yourName
```

---

## 🔹 Step 3: Always Get Latest Updates Before Work

Before starting work each day:

```bash
git pull origin main
```

👉 This ensures you have the latest team updates.

---

## 🔹 Step 4: (Optional) Create a Branch From Teammate's Branch

If you need the latest shared work from a teammate branch:

```bash
git checkout sanjay
git pull
git checkout -b arun
```

👉 Now your branch includes Sanjay's latest work.

---

## 🔹 Step 5: Work & Commit Changes

```bash
git add .
git commit -m "Updated login validation"
```

---

## 🔹 Step 6: Push Your Branch

```bash
git push origin yourName
```

---

## 🔹 Step 7: Create a Pull Request (PR)

1. Go to the repository on GitHub.
2. Click **Compare & pull request**.
3. Ensure:
   - base → `main`
   - compare → `yourName`
4. Add description.
5. Click **Create Pull request**.

---

## 🔹 Step 8: Wait for Review & Approval

✔ Fix comments if requested  
✔ After approval → PR will be merged into `main`

---

## ⚠️ Important Rules

❌ Do NOT push to `main`  
❌ Do NOT merge your own PR without approval  
✔ Always pull latest code before working  
✔ Work only in your personal branch  

---

## 🎯 Branch Structure

```
main    → final stable code
sanjay  → Sanjay's work
arun    → Arun's work
priya   → Priya's work
```

---

Following this workflow prevents conflicts and keeps the project organized.
