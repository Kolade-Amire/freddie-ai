# Freddie AI

A backend pipeline to automate recruitment using Google Sheets, Drive, Gmail, and OpenAI.

## Prerequisites
- Node.js (>= 16.x)
- Docker (optional for containerization)
- Google API credentials (Sheets, Drive, Gmail)
- OpenAI API key

## Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/Kolade-Amire/freddie-ai.git
   
   cd freddie-ai (or local directory where clone exists in)
   
2. install dependencies
   ```bash
   npm install
3. run app without docker
   ```bash
   npm run dev
4. run with docker (must have docker installed)
   ```bash
   docker-compose up --build
5. access app through UI
   ```bash
   http://localhost:3000 
