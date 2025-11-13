import React from 'react';
import { FaHeart, FaCalendarAlt, FaGithub, FaEnvelope } from 'react-icons/fa';
import { Container } from 'react-bootstrap';
// Asegúrate de que el path a tu CSS sea correcto
import '../Styles/Footer.css'; 

export const Footer = () => (
    // Clase 'elegant-footer' para aplicar el CSS sobrio
    <footer className="footer elegant-footer mt-auto py-4 bg-dark text-light border-top border-secondary">
        <Container className="text-center">
            
            {/* 1. Título Original */}
            <h5 className="mb-3 fw-bold footer-title"> 
                <FaCalendarAlt className="me-2" />
                FunFetch
            </h5>

            {/* 3. Línea Divisoria Simple */}
            <div className="divider-line"></div> 

            {/* 4. Mensaje Original y Sobrio */}
            <p className="footer-copyright small mb-0 pt-3">
                © {new Date().getFullYear()} :).
            </p>
            
        </Container>
    </footer>
);