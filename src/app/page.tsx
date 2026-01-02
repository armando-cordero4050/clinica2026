import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Shield, Users, Trophy, Building2, UserCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold tracking-tighter text-blue-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg transform rotate-45"></div>
                IMFOHSA <span className="text-gray-400 font-light text-sm hidden sm:inline">| Innovación Dental</span>
            </div>
            {/* Nav Links Removed as requested */}
            <Link href="/login">
                <Button className="rounded-full px-6 bg-blue-900 hover:bg-blue-800 text-white shadow-lg transition-transform hover:scale-105">
                    Portal Clientes
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-2/3 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                    <Star className="w-3 h-3" /> Líderes desde 1996
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-slate-900">
                    Tu aliado en <span className="text-blue-600">Excelencia Dental</span>.
                </h1>
                <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
                    Desde la importación de las mejores marcas mundiales hasta la sala de ventas más confortable de Latinoamérica.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/login">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-200 w-full sm:w-auto">
                            Ingresar al Portal
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 w-full sm:w-auto">
                        Conocer Más
                    </Button>
                </div>
            </div>
            
            <div className="lg:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white animate-in zoom-in duration-1000 delay-200 bg-white group">
                     {/* Modern Real Image Showroom */}
                     <div className="aspect-video relative overflow-hidden">
                         <img 
                            src="https://www.imfohsa.com/web/image/1052095-5b2e33c4/edificio-imfohsa2025.jpg" 
                            alt="Edificio IMFOHSA Showroom" 
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                         />
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                             <div className="font-bold text-lg">Edificio IMFOHSA</div>
                             <div className="text-sm opacity-80">La casa dental más confortable de Latinoamérica</div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section id="fundador" className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col md:flex-row">
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-blue-400" />
                        Nuestro Fundador
                    </h2>
                    <h3 className="text-xl text-blue-200 font-semibold mb-4">Georg Joachim Bruns Schueffler</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                        Fundador de IMFOHSA en 1996. Tras la disolución del original &quot;Depósito Dental San Antonio&quot; (1931), Georg Joachim estableció una visión clara: innovación y satisfacción del cliente.
                    </p>
                    <p className="text-slate-400 text-sm italic border-l-4 border-blue-500 pl-4">
                        &quot;Ver el mundo dental desde los ojos del odontólogo y el técnico dental para entender sus retos y necesidades.&quot;
                    </p>
                </div>
                <div className="md:w-1/2 bg-slate-800 relative overflow-hidden">
                    <img 
                        src="https://www.imfohsa.com/web/image/1024487-123eba1e/Captura%20de%20pantalla%202025-10-07%20095522.png" 
                        alt="Georg Joachim Bruns Schueffler" 
                        className="w-full h-full object-cover object-top opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-6 right-6 bg-blue-600 px-4 py-2 rounded-lg text-white font-bold shadow-lg">
                        1996
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* HISTORY TIMELINE */}
      <section id="historia" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Así se escribe nuestra historia...</h2>
                <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { year: "1931", title: "El Origen", desc: "Fundación del Depósito Dental San Antonio por Antonia Kersig." },
                    { year: "1996", title: "Nace Imfohsa", desc: "Georg Joachim Bruns y Stefan Bruns abren la primera tienda en Zona 4." },
                    { year: "Zona 4", title: "Test Drive", desc: "Se inaugura el primer Showroom de 100m² bajo el concepto 'Tocar y Probar'." },
                    { year: "Innovación", title: "Smile Factory", desc: "Nace la clínica modelo enfocada en confort y excelencia clínica." },
                    { year: "Expansión", title: "Xela & Huehue", desc: "Apertura de sucursales en Quetzaltenango y Huehuetenango." },
                    { year: "Tech", title: "ImfohsaLab", desc: "Pioneros en incorporar el primer sistema CAD/CAM comercial en Guatemala." },
                    { year: "Academy", title: "Dental Academy", desc: "Espacio renovado para la formación académica de odontólogos." },
                    { year: "Hoy", title: "Líderes", desc: "La sala de ventas más innovadora y confortable de Latinoamérica." }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border-l-4 border-blue-600">
                        <div className="text-blue-600 font-bold text-xl mb-2">{item.year}</div>
                        <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* VALUES SECTION (Detailed) */}
      <section id="valores" className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
                <p className="text-gray-500">Los pilares fundamentales que sostienen nuestra excelencia.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Disciplina", icon: Shield, desc: "Cumplir con lo solicitado en el tiempo acordado." },
                    { title: "Mejora Continua", icon: Trophy, desc: "Aprendizaje intencional, más allá del promedio." },
                    { title: "Franqueza", icon: UserCircle, desc: "Decir las cosas de frente y sin rodeos." },
                    { title: "Actitud de Servicio", icon: Star, desc: "Dispuestos a servir y apoyarnos entre departamentos." },
                    { title: "Trabajo en Equipo", icon: Users, desc: "Apoyo mutuo para lograr objetivos comunes." },
                    { title: "Hacer lo Correcto", icon: Building2, desc: "Integridad en acciones, conversaciones y decisiones." }
                ].map((item, i) => (
                    <div key={i} className="group bg-slate-50 p-8 rounded-2xl hover:bg-blue-600 hover:text-white transition-all cursor-default">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-sm">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-500 group-hover:text-blue-100 transition-colors leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
                <span className="text-white font-bold text-lg">IMFOHSA</span> © 2026
            </div>
            <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-white transition-colors">Aviso Legal</a>
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
        </div>
      </footer>
    </div>
  )
}
