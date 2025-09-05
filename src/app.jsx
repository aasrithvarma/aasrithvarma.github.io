// src/App.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Auto-counting stats component
function Counter({ label, end }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / 100;
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);
    return () => clearInterval(interval);
  }, [end]);
  return (
    <div className="p-4 bg-white shadow rounded text-center">
      <div className="text-2xl font-bold text-red-600">{count}+</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </div>
  );
}

// Mini-game component (catch falling hearts)
function HeartGame() {
  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.random() * 90;
      setHearts((prev) => [...prev, { id: Date.now(), x }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fall = setInterval(() => {
      setHearts((prev) =>
        prev
          .map((h) => ({ ...h, y: (h.y || 0) + 2 }))
          .filter((h) => h.y < 100)
      );
    }, 30);
    return () => clearInterval(fall);
  }, []);

  const catchHeart = (id) => {
    setScore(score + 1);
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="relative h-40 bg-red-50 rounded p-2 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{ left: `${h.x}%`, top: `${h.y || 0}%` }}
          className="absolute text-red-500 text-xl cursor-pointer animate-bounce"
          onClick={() => catchHeart(h.id)}
        >
          ❤️
        </div>
      ))}
      <div className="absolute bottom-2 right-2 font-bold">Score: {score}</div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-800 antialiased">
      {/* Structured Data for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Dr. Tanmai Aasrith Varma Ayenampudi",
          "url": "https://aasrithvarma.github.io",
          "email": "dr.avie@outlook.com",
          "sameAs": [
            "https://linkedin.com/in/aasrithvarma",
            "https://instagram.com/aviesgram",
            "http://orcid.org/0000-0002-9581-7480",
            "https://www.researchgate.net/profile/Tanmai-Aasrith-Varma-Ayenampudi"
          ],
          "jobTitle": "Pediatric Cardiac Surgery Aspirant",
          "birthDate": "2000-11",
          "birthPlace": "Visakhapatnam, Andhra Pradesh, India"
        })}
      </script>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-red-600 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="font-semibold">Dr. Tanmai Aasrith</div>
              <div className="text-xs text-gray-600">Pediatric Cardiac Surgery | Founder — Savière</div>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#about" className="hover:text-red-600">About</a>
            <a href="#saviere" className="hover:text-red-600">Savière</a>
            <a href="#medicine" className="hover:text-red-600">Medicine</a>
            <a href="#values" className="hover:text-red-600">Values</a>
            <a href="#impact" className="hover:text-red-600">Impact</a>
            <a href="#contact" className="hover:text-red-600">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Dr. Tanmai Aasrith Varma Ayenampudi</h1>
            <p className="mt-4 text-lg text-gray-700">
              I believe in a world where **health, education, equality, and sustainability** are universal rights.
              Aspiring pediatric cardiac surgeon · Founder of <span className="font-semibold">Savière</span> · Vegan & environmental activist · Feminist · Advocate of preventive health.
            </p>
          </motion.div>

          <motion.div className="w-full md:w-96 bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
            <div className="w-36 h-36 rounded-full bg-gray-100 ring-4 ring-red-50 flex items-center justify-center text-4xl font-bold text-red-600">TA</div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">Doctor & Dreamer</div>
              <div className="mt-2 font-medium">Balancing medicine, sustainability, and activism</div>
            </div>
          </motion.div>
        </section>

        {/* About */}
        <section id="about" className="mt-16">
          <h2 className="text-2xl font-bold">About Me</h2>
          <p className="mt-4 text-gray-700">
            Born in **November 2000** in Visakhapatnam to Satish Kumar Ayenampudi and Vijaya Kumari Ayenampudi, I love exploring new ideas, learning, and having meaningful conversations. 
            My passion for advocating **equal education, poverty eradication, environmentalism, veganism, and feminism** comes from believing in fairness, compassion, and sustainable development aligned with UN SDGs.
          </p>
        </section>

        {/* Saviere */}
        <section id="saviere" className="mt-16 bg-red-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-2xl font-bold text-red-600">Savière — Vision & Mission</h2>
          <p className="mt-4 text-gray-700">
            Savière is a philosophy, not just fashion. Founded by me, it aspires to redefine luxury through **sustainability, vegan ethics, and mindful craftsmanship**. We celebrate Indian heritage while reducing waste and promoting conscious living.
          </p>
        </section>

        {/* Medical Aspirations */}
        <section id="medicine" className="mt-16">
          <h2 className="text-2xl font-bold">Medical Aspirations</h2>
          <p className="mt-4 text-gray-700">
            My dream is to become a **pediatric cardiac surgeon**, providing world-class care to children with congenital heart conditions. I believe in blending surgical excellence with preventive health education for healthier futures.
          </p>
        </section>

        {/* Values */}
        <section id="values" className="mt-16 bg-red-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-2xl font-bold text-red-600">Core Values</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-lg shadow text-center">
              <div className="font-semibold">Environment</div>
              <p className="mt-2 text-gray-600">Advocating for sustainability and climate-conscious living.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow text-center">
              <div className="font-semibold">Feminism</div>
              <p className="mt-2 text-gray-600">Promoting gender equality in medicine, business, and education.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow text-center">
              <div className="font-semibold">Veganism</div>
              <p className="mt-2 text-gray-600">Championing plant-based living for health and compassion.</p>
            </div>
          </div>
        </section>

        {/* Impact / Stats */}
        <section id="impact" className="mt-16">
          <h2 className="text-2xl font-bold">Impact Stats</h2>
          <p className="mt-2 text-gray-700">I love creating positive change. Here’s a glimpse of ongoing impact:</p>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <Counter label="Trees Planted" end={1200} />
            <Counter label="Children Educated" end={850} />
            <Counter label="Vegan Meals Served" end={4500} />
          </div>
          <div className="mt-6">
            <h3 className="font-bold mb-2">Playful Mini-Game</h3>
            <p className="text-gray-600 mb-2">Catch falling hearts and spread love! ❤️</p>
            <HeartGame />
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-16 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-red-600">Get in Touch</h2>
          <div className="mt-4 text-gray-700">
            For collaborations, mentorship, or inquiries:
            <ul className="mt-2 space-y-1">
              <li>Email: <a href="mailto:dr.avie@outlook.com" className="text-red-600 hover:underline">dr.avie@outlook.com</a></li>
              <li>LinkedIn: <a href="https://linkedin.com/in/aasrithvarma" className="text-red-600 hover:underline">linkedin.com/in/aasrithvarma</a></li>
              <li>Instagram: <a href="https://instagram.com/aviesgram" className="text-red-600 hover:underline">@aviesgram</a></li>
              <li>ORCID: <a href="http://orcid.org/0000-0002-9581-7480" className="text-red-600 hover:underline">0000-0002-9581-7480</a></li>
              <li>ResearchGate: <a href="https://www.researchgate.net/profile/Tanmai-Aasrith-Varma-Ayenampudi" className="text-red-600 hover:underline">Profile</a></li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 py-6 text-sm text-gray-600 text-center border-t">
          © {new Date().getFullYear()} Dr. Tanmai Aasrith Varma Ayenampudi — All Rights Reserved
        </footer>
      </main>
    </div>
  );
}

export default App;
