import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
// 💡 CORRECCIÓN DEL ERROR DE IMPORTACIÓN DE CSS
import 'react-toastify/dist/ReactToastify.css'; 
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaPlus, FaDollarSign, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { MdOutlineDateRange } from "react-icons/md";
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'; 
import '../Styles/EventosApp.css';

// Constantes - URL ORIGINAL RESTAURADA
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxU4yG62JjOIwDBeKDYrn2i89yJmrrRMv5dNOO1ZuAIsmBbYgR3v4BPftdwk1CfxkwH/exec";

// Funciones auxiliares (Sin cambios)
const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  try {
    const iso = new Date(dateString);
    if (!isNaN(iso.getTime())) return iso;
    return new Date(dateString.replace(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/, '$2 $1, $3'));
  } catch {
    return null;
  }
};

const formatDate = (dateString) => {
    const date = parseDate(dateString);
    if (!date) return dateString;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
};

// =========================================================
// COMPONENTES REUTILIZABLES
// =========================================================

// Componente para manejar la votación de Alejo y Lau
// AHORA RECIBE 'isVoting' para deshabilitar botones
const VoterButtons = ({ event, handleVote, isVoting }) => {
    return (
        <Col xs={12} md={5} className="vote-section">
            {/* Votación de Alejo (TuVoto) */}
            <div className="voter-group">
                <span className="voter-name">Alejo</span>
                <div className="voter-buttons">
                    <Button 
                        variant={event.TuVoto === 'SI' ? "success" : "outline-success"}
                        size="sm"
                        onClick={() => event.ID ? handleVote(event.ID, 'SI', 'TuVoto') : toast.error("Evento sin ID válido")}
                        disabled={!event.ID || isVoting} // DESHABILITADO durante la votación
                    >
                        <FaThumbsUp size={12} />
                    </Button>
                    <Button 
                        variant={event.TuVoto === 'NO' ? "danger" : "outline-danger"}
                        size="sm"
                        onClick={() => event.ID ? handleVote(event.ID, 'NO', 'TuVoto') : toast.error("Evento sin ID válido")}
                        disabled={!event.ID || isVoting} // DESHABILITADO durante la votación
                    >
                        <FaThumbsDown size={12} />
                    </Button>
                </div>
            </div>
            
            {/* Votación de Lau (Amigo1Voto) */}
            <div className="voter-group">
                <span className="voter-name">Lau</span>
                <div className="voter-buttons">
                    <Button 
                        variant={event.Amigo1Voto === 'SI' ? "success" : "outline-success"}
                        size="sm"
                        onClick={() => event.ID ? handleVote(event.ID, 'SI', 'Amigo1Voto') : toast.error("Evento sin ID válido")}
                        disabled={!event.ID || isVoting} // DESHABILITADO durante la votación
                    >
                        <FaThumbsUp size={12} />
                    </Button>
                    <Button 
                        variant={event.Amigo1Voto === 'NO' ? "danger" : "outline-danger"}
                        size="sm"
                        onClick={() => event.ID ? handleVote(event.ID, 'NO', 'Amigo1Voto') : toast.error("Evento sin ID válido")}
                        disabled={!event.ID || isVoting} // DESHABILITADO durante la votación
                    >
                        <FaThumbsDown size={12} />
                    </Button>
                </div>
            </div>
        </Col>
    );
};

// Componente para el evento más votado y próximo (Sin cambios)
const FeaturedEventCard = ({ event }) => {
    if (!event) return null;

    const eventDate = parseDate(event.Fecha);
    const timeUntil = eventDate ? eventDate.getTime() - new Date().getTime() : 0;
    const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
    
    const day = eventDate ? eventDate.getDate() : '--';
    const month = eventDate ? eventDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '') : '---';

    return (
        <div className="featured-card mb-5">
            <Row className="g-0">
                <Col md={5}>
                    <div className="featured-image-container">
                        <img src={event.LinkImagen} alt={event.Nombre} className="featured-image" />
                    </div>
                </Col>
                <Col md={7} className="featured-details-col">
                    <h2 className="featured-title">¡PRÓXIMO EVENTO EN MENTE!</h2>
                    <h1 className="featured-event-name">{event.Nombre}</h1>

                    <div className="featured-date-location">
                        <div className="date-box">
                            <span className="date-day">{day}</span>
                            <span className="date-month-year">{month} / {eventDate ? eventDate.getFullYear() : '----'}</span>
                        </div>
                        
                        <div className="location-box d-flex flex-column align-items-start">
                            <p className="mb-1"><FaMapMarkerAlt className="me-2" /> {event.Lugar}</p>
                            <p className="mb-1"><FaDollarSign className="me-2" /> ${Number(event.CostoEstimado).toLocaleString('es-CO')}</p>
                            {daysUntil > 0 && 
                                <p className="mb-0 text-primary fw-bold">
                                    <FaCalendarAlt className="me-2" /> ¡Faltan {daysUntil} días!
                                </p>
                            }
                        </div>
                    </div>

                    <div className="featured-vote-summary mt-3">
                        <p className="fw-bold mb-1">Votos Confirmados: 
                            <span className="badge bg-success ms-2 me-1">{event.TotalVotosSI} Sí</span>
                            <span className="badge bg-danger">{event.TotalVotosNO} No</span>
                        </p>
                    </div>

                    {event.LinkVenta && (
                        <a href={event.LinkVenta} target="_blank" rel="noopener noreferrer">
                            <Button variant="primary" size="lg" className="mt-4 purchase-btn">
                                COMPRAR BOLETAS
                            </Button>
                        </a>
                    )}
                </Col>
            </Row>
        </div>
    );
};


// =========================================================
// COMPONENTE PRINCIPAL HOME
// =========================================================

export const Home = () => {
  const [events, setEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false); // 🆕 Estado para manejar la fluidez

  // ✅ Obtener datos y determinar evento destacado (Ajuste menor para evitar toast al votar)
  const fetchEvents = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch(SHEET_API_URL, { method: 'GET', mode: 'cors', redirect: 'follow' });
      const text = await response.text();
      let data = [];
      try { data = JSON.parse(text); } catch (err) { console.warn("⚠️ Respuesta no JSON:", text); }

      const normalized = Array.isArray(data)
        ? data.map(d => ({
            ID: String(d.ID) || null, 
            Nombre: d.Nombre || '',
            Fecha: d.Fecha || '',
            Lugar: d.Lugar || '',
            LinkImagen: d.LinkImagen || '',
            LinkVenta: d.LinkVenta || '',
            CostoEstimado: d.CostoEstimado || 0,
            TuVoto: d.TuVoto || '', 
            Amigo1Voto: d.Amigo1Voto || '',
            TotalVotosSI: Number(d.TotalVotosSI) || 0, 
            TotalVotosNO: Number(d.TotalVotosNO) || 0,
          }))
        : [];

      const now = new Date();
      const upcomingEvents = normalized
        .filter(e => {
            const date = parseDate(e.Fecha);
            return date && date.getTime() > now.getTime() && e.TotalVotosSI >= 2;
        })
        .sort((a, b) => {
            const dateA = parseDate(a.Fecha);
            const dateB = parseDate(b.Fecha);
            return dateA.getTime() - dateB.getTime(); 
        });

      setFeaturedEvent(upcomingEvents.length > 0 ? upcomingEvents[0] : null);
      setEvents(normalized.filter(e => e.ID !== (upcomingEvents[0]?.ID || null))); 
      
      if (!isSilent) {
        toast.success("Eventos cargados correctamente.", { autoClose: 1200 });
      }
    } catch (error) {
      console.error("❌ Error al conectar:", error);
      toast.error("Error al conectar con la base de datos.");
      setEvents([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ✅ Enviar nuevo evento (Se mantiene igual)
  const handleAddEvent = async (eventData) => {
    try {
        const response = await fetch(SHEET_API_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify(eventData), });
        const text = await response.text();
        let res = {};
        try { res = JSON.parse(text); } catch (e) { throw new Error("Respuesta inválida del servidor."); }
  
        if (res.success) {
          toast.success("🎉 Evento agregado exitosamente!", { autoClose: 2000 });
          fetchEvents();
        } else {
          throw new Error(res.error || "Error al guardar.");
        }
      } catch (error) {
        console.error("❌ Error al agregar evento:", error);
        toast.error("Error al agregar el evento: " + (error.message || 'Error desconocido.'));
      }
  };
  
  // 🔄 FUNCIÓN DE VOTO CON ACTUALIZACIÓN OPTIMISTA PARA FLUIDEZ
  const handleVote = async (id, voteType, voterField) => {
    if (!id || id === 'null' || id === 'undefined') {
        toast.error("El evento no tiene ID válido para votar.");
        return;
    }
    
    // 1. Bloqueo de UI y Preparación
    if (isVoting) return; // Evita clics dobles
    setIsVoting(true); // Bloqueo de botones para dar feedback visual
    
    const data = { ID: id, Voto: voteType, VoterField: voterField };
    const voteStatusText = voteType === 'SI' ? 'confirmado' : 'negado';

    const eventIndex = events.findIndex(e => e.ID === id);
    const eventToUpdate = eventIndex !== -1 ? events[eventIndex] : null;
    if (!eventToUpdate) {
        toast.error("Evento no encontrado en la lista.");
        setIsVoting(false);
        return;
    }
    const originalEvent = { ...eventToUpdate };

    // 2. 🚀 ACTUALIZACIÓN OPTIMISTA (La interfaz cambia INMEDIATAMENTE)
    const oldVote = originalEvent[voterField];
    const isVoteChanging = oldVote !== voteType;

    if (isVoteChanging) {
        const updatedEvents = [...events];
        let siChange = 0;
        let noChange = 0;
        
        // Calculamos el cambio en los totales
        if (voteType === 'SI') {
            siChange = 1;
            if (oldVote === 'NO') noChange = -1; 
        } else { // voteType === 'NO'
            noChange = 1;
            if (oldVote === 'SI') siChange = -1; 
        }
        
        // Aplicamos el cambio al objeto local
        updatedEvents[eventIndex] = {
            ...eventToUpdate,
            [voterField]: voteType, 
            TotalVotosSI: originalEvent.TotalVotosSI + siChange,
            TotalVotosNO: originalEvent.TotalVotosNO + noChange,
        };

        setEvents(updatedEvents); // Aplicamos el cambio local (¡Instantáneo!)
        toast.info(`🗳️ Voto ${voteStatusText}. Esperando confirmación...`, { autoClose: 2000 });

    } else {
        // Mismo voto: solo notificamos sin actualizar el estado, ya que no cambió.
        toast.info(`Ya tienes tu voto en ${voteType}.`, { autoClose: 1500 });
        setIsVoting(false); // Desbloqueamos inmediatamente si no hay cambio
        return;
    }
    
    // 3. 📤 Llamada al Backend
    try {
        const response = await fetch(SHEET_API_URL + "?action=vote", { 
            method: 'POST', 
            redirect: 'follow', 
            body: JSON.stringify(data), 
        });
        
        const text = await response.text();
        let res = {};
        try { res = JSON.parse(text); } catch (e) { /* Se asume éxito si no hay JSON de error */ }
        
        if (res.success || res.status === 'success' || !res.error) { // Lógica para manejar la respuesta del Google Script
            toast.success(`👍 Voto registrado con éxito.`, { autoClose: 1500 });
            // Recargamos el estado final para sincronizar FeaturedEvent y los totales definitivos
            setTimeout(() => { fetchEvents(true); }, 500); // Recarga silenciosa
        } else {
            // ❌ Fallo: Revertimos el estado local (Rollback)
            throw new Error(res.error || "Error al registrar el voto.");
        }
    } catch (error) {
        console.error("❌ Error al votar:", error);
        // Revertimos al estado original
        setEvents(prev => prev.map(e => e.ID === id ? originalEvent : e)); 
        toast.error(`Error de conexión. Se revirtió el cambio.`, { autoClose: 4000 });
    } finally {
        setIsVoting(false); // 🆕 Finalizamos el bloqueo de votación
    }
  };


  // ✅ Modal de agregar evento (Se mantiene igual)
  const AddEventModal = () => {
    const [formData, setFormData] = useState({
        Nombre: '', Fecha: '', Lugar: '', LinkImagen: '', LinkVenta: '', CostoEstimado: ''
      });
  
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };
  
      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.Nombre || !formData.Lugar || !formData.LinkImagen) {
          toast.error("Completa los campos requeridos.");
          return;
        }
        handleAddEvent(formData);
        setFormData({ Nombre: '', Fecha: '', Lugar: '', LinkImagen: '', LinkVenta: '', CostoEstimado: '' });
        setShowModal(false);
      };
  
      return (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>✨ Agregar Nuevo Evento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control name="Nombre" value={formData.Nombre} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control name="Fecha" value={formData.Fecha} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Lugar *</Form.Label>
                <Form.Control name="Lugar" value={formData.Lugar} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link de Imagen *</Form.Label>
                <Form.Control name="LinkImagen" value={formData.LinkImagen} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Costo Estimado (COP)</Form.Label>
                <Form.Control type="number" name="CostoEstimado" value={formData.CostoEstimado} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link de Venta (Opcional)</Form.Label>
                <Form.Control name="LinkVenta" value={formData.LinkVenta} onChange={handleChange} />
              </Form.Group>
              <Button type="submit" className="w-100 mt-3">Guardar Evento</Button>
            </Form>
          </Modal.Body>
        </Modal>
      );
  };


  return (
    <div className="app-container">
        <div className="content-wrapper container"> {/* Nuevo wrapper para Sticky Footer */}
            <ToastContainer position="bottom-right" />
            <div className="page-header my-4 text-center">
                <h1 className="fw-bold">Eventos</h1>
                <p className="lead">¡Agrega y consulta los próximos planes!</p>
            </div>

            {loading ? (
                <div className="text-center my-5">
                <h4>Cargando eventos...</h4>
                <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <>
                {/* 1. SECCIÓN DESTACADA */}
                {featuredEvent && <FeaturedEventCard event={featuredEvent} />}
                
                {/* 2. LISTA DE EVENTOS */}
                <h3 className="mb-3 fw-bold mt-4">Otros Eventos</h3>
                <div className="event-list-container mt-4">
                    {events.length === 0
                        ? <p className="text-center">No hay más eventos disponibles. ¡Agrega uno!</p>
                        : events.map((e, i) => (
                            <div key={i} className="event-list-item">
                                <Row className="align-items-center g-3">
                                    <Col xs={12} md={2}>
                                        <img src={e.LinkImagen || "https://via.placeholder.com/100x70?text=IMG"} alt={e.Nombre} className="event-list-image" />
                                    </Col>
                                    <Col xs={12} md={5}> 
                                        <h6 className="event-list-title">
                                            {e.Nombre}
                                            {e.LinkVenta && (
                                                <a href={e.LinkVenta} target="_blank" rel="noopener noreferrer" className="ms-2 badge bg-info text-dark">Venta</a>
                                            )}
                                        </h6>
                                        <p className="event-list-details mb-1"><MdOutlineDateRange /> {formatDate(e.Fecha)}</p>
                                        <p className="event-list-details mb-0"><FaMapMarkerAlt /> {e.Lugar} • <FaDollarSign /> ${Number(e.CostoEstimado).toLocaleString('es-CO')}</p>
                                        <div className="vote-summary mt-2">
                                            <small className="fw-bold">Totales: </small>
                                            <span className="badge bg-success ms-1 me-1">Sí: {e.TotalVotosSI}</span>
                                            <span className="badge bg-danger">No: {e.TotalVotosNO}</span>
                                        </div>
                                    </Col>
                                    
                                    {/* Componente de Votación DUAL */}
                                    <VoterButtons event={e} handleVote={handleVote} isVoting={isVoting} />
                                </Row>
                            </div>
                        ))}
                </div>
                </>
            )}

            <Button className="add-event-btn btn-primary" onClick={() => setShowModal(true)}>
                <FaPlus />
            </Button>

            <AddEventModal />
        </div>
    </div>
  );
};

export default Home;