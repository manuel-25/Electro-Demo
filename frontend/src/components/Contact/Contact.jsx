import React, { useState, useRef, useMemo } from 'react'
import './Contact.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'  //faEnvelope, faPhone 
import { faWhatsapp, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons'
import { faqs } from '../../utils/productsData'
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import { Helmet } from 'react-helmet';

const libraries = ["places"]
const locations = [
    { lat: -34.6428301, lng: -58.3745474, name: "Electrosafe Service Electrodomesticos (Llamados y Whatsapp)", url: "https://www.google.com.ar/maps/place/Electrosafe+Service+Electrodomesticos+(Llamados+y+Whatsapp)/@-34.6428257,-58.3771277,17z/data=!3m1!4b1!4m6!3m5!1s0x95a32f86a4e7a6f9:0x48efe2a55af0f759!8m2!3d-34.6428301!4d-58.3745474!16s%2Fg%2F11rtm81rkx?hl=es&entry=ttu" },
    { lat: -34.7213736, lng: -58.2693768, name: "Electrosafe Service (Llamadas y Whatsapp)", url: "https://www.google.com.ar/maps/place/Electrosafe+Service+(Llamadas+y+Whatsapp)/@-34.7213736,-58.2693768,17z/data=!3m1!4b1!4m6!3m5!1s0x95a3332dc6e1e2eb:0x91e0a93b10ba873!8m2!3d-34.721378!4d-58.2667965!16s%2Fg%2F1w113c0q?hl=es&entry=ttu" },
]

const Contact = () => {
    const [activeIndex, setActiveIndex] = useState(null)
    const faqRef = useRef(null)

    const handleToggle = index => {
        setActiveIndex(activeIndex === index ? null : index)
    }

    const scrollToFAQ = () => {
        const faqElement = faqRef.current
        const offset = faqElement.getBoundingClientRect().top + window.pageYOffset - 100
        window.scrollTo({ top: offset, behavior: 'smooth' })
    }

    const GoogleMaps = ({ apiKey }) => {
        const { isLoaded, loadError } = useLoadScript({
            googleMapsApiKey: apiKey,
            libraries,
        })

        const center = useMemo(() => ({ lat: -34.6428301, lng: -58.3745474 }), [])

        if (loadError) return <div>Error loading maps</div>
        if (!isLoaded) return <div>Loading...</div>

        return (
            <GoogleMap
                mapContainerStyle={{ height: '400px', width: '100%' }}
                center={center}
                zoom={15}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false
                }}
            >
                {locations.map((location, index) => (
                    <MarkerF
                        key={index}
                        position={{ lat: location.lat, lng: location.lng }}
                        onClick={() => window.open(location.url, '_blank')}
                    />
                ))}
            </GoogleMap>
        )
    }

    return (
        <>
            <Helmet>
                <title>Contacto | Electrosafe - Service de Electrodomésticos en Quilmes y Barracas</title>
                <meta name="description" content="Comunicate con Electrosafe para presupuestos y consultas. Sucursales en Quilmes y Barracas. Soporte por WhatsApp, teléfono o email." />
                
                <meta property="og:title" content="Contacto | Electrosafe" />
                <meta property="og:description" content="Consultas, cotizaciones o soporte técnico. Atención personalizada en nuestras sucursales de Barracas y Quilmes." />
                <meta property="og:image" content="https://electrosafeweb.com/logo.png" />
                <meta property="og:url" content="https://electrosafeweb.com/contacto" />
                <meta property="og:type" content="website" />

                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://electrosafeweb.com/contacto" />
            </Helmet>
            <div className="contact-section">
                <section className="contact-content">
                    <h1>¿Tenés alguna duda?</h1>
                    <span>¿Necesitas ayuda con tu reparación?</span>
                    <p>No dudes en contactarnos. Estamos acá para ayudarte.</p>
                    <button className="contact-button" onClick={scrollToFAQ}>Soporte</button>
                </section>
                <section className="frequent-question-container" ref={faqRef}>
                    {faqs.map((faq, index) => (
                        <div key={index} className="frequent-question">
                            <div className="question" onClick={() => handleToggle(index)}>
                                <p>{faq.question}</p>
                                <FontAwesomeIcon icon={faChevronDown} className={`rotate ${activeIndex === index ? 'up' : ''}`} />
                            </div>
                            <div className={`answer ${activeIndex === index ? 'active' : ''}`}>{faq.answer}</div>
                        </div>
                    ))}
                </section>
                <section className="contact-socials">
                    <h3>Contacto y Soporte</h3>
                    <span>¿Seguís con dudas? ¡Comunicate!</span>
                        <div className="socials-container">
                            <div className="contact-card">
                                <div className="social-item">
                                <div className="phone-numbers">
                                    <p><a href="tel:5491178967720">+54 9 11 7896-7720</a></p>
                                </div>
                                </div>
                            </div>

                            <div className="contact-card">
                                <div className="social-item">
                                <a href="mailto:electrosafeservice@gmail.com" id="social-email">
                                    electrosafeservice@gmail.com
                                </a>
                                </div>
                            </div>

                            <div className="contact-card">
                                <div className="social-item">
                                    <div className="social-logos">
                                    <a
                                        href="https://wa.me/5491139148766"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="WhatsApp"
                                    >
                                        <FontAwesomeIcon icon={faWhatsapp} />
                                    </a>

                                    <a
                                        href="https://www.instagram.com/electrosafeok/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Instagram"
                                    >
                                        <FontAwesomeIcon icon={faInstagram} />
                                    </a>

                                    <a
                                        href="https://www.facebook.com/electrosafequilmes/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Facebook"
                                    >
                                        <FontAwesomeIcon icon={faFacebookF} />
                                    </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div className="branch-locations">
                        <h4>Contactá tu sucursal</h4>

                        <div className="branch-cards">
                            <a
                            href="https://wa.me/5491178967720?text=Hola,%20me%20comunico%20con%20la%20sucursal%20Quilmes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="branch-card"
                            >
                            <img
                                src="/casita.png"
                                alt="Sucursal Quilmes"
                                className="branch-card-icon"
                            />
                            <div className="branch-card-text">
                                <strong>Quilmes</strong>
                                <span>Av. Vicente López 770</span>
                            </div>
                            </a>
                        </div>
                    </div>
                    <div className="map-container">
                        {process.env.REACT_APP_GOOGLE_API_KEY ? (
                            <GoogleMaps apiKey={process.env.REACT_APP_GOOGLE_API_KEY} />
                        ) : null}
                    </div>
                </section>
            </div>
        </>
    )
}

export default Contact
