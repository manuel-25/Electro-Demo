import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { products, additionalDetailsConfig } from '../../utils/productsData.jsx'
import { steps } from '../../utils/productsData.jsx'
import { logError } from '../../utils/logger.js'
import { getApiUrl } from '../../config.js'
import { Helmet } from 'react-helmet'
import './Services.css'

// Importar los subcomponentes
import CategorySelection from '../CategorySelection/CategorySelection'
import BrandSelection from '../BrandSelection/BrandSelection'
import ModelSelection from '../ModelSelection/ModelSelection'
import FaultSelection from '../FaultSelection/FaultSelection'
import InformationForm from '../InformationForm/InformationForm'
import FormSubmissionStatus from '../FormSubmissionStatus/FormSubmissionStatus'
import ProgressBar from '../ProgressBar/ProgressBar'
import AdditionalDetailsStep from '../AdditionalDetailsStep/AdditionalDetailsStep'
import ServiceSelection from '../ServiceSelection/ServiceSelection.jsx'

const Services = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)

  // Estado para el paso actual, datos del formulario, estado de envío y detalles adicionales
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    date: '',
    category: { id: '', name: '' },
    brand: '',
    model: '',
    faults: '', 
    additionalDetails: {},
    details: 'N/A',
    userData: { customerNumber: '', serviceRequestNumber: '', firstName: '' },
    branch: ''
  })
  const [submitStatus, setSubmitStatus] = useState('pending')
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)

  // Parámetros de búsqueda para categorías, marcas y modelos seleccionados
  const selectedCategory = queryParams.get('category') || null
  const selectedBrand = queryParams.get('brand') || null
  const selectedModel = queryParams.get('model') || null

  // Comprobar si la categoría seleccionada es válida
  const isValidCategory = products.some(product => product.name === selectedCategory)
  const validCategory = isValidCategory ? selectedCategory : null
  const selectedProduct = validCategory ? products.find(product => product.name === validCategory) : null

  // Efecto para inicializar la categoría seleccionada
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prevState => ({
        ...prevState,
        category: { id: selectedProduct.id, name: selectedProduct.name }
      }))
      setStep(2)
    }
  }, [selectedProduct])

  // Efecto para actualizar la marca seleccionada
  useEffect(() => {
    if (selectedBrand) {
      updateFormData('brand', selectedBrand)
    }
  }, [selectedBrand])

  // Efecto para manejar el paso en función de las selecciones
  useEffect(() => {
    if (selectedBrand && selectedModel) {
      setStep(4)
    } else if (selectedBrand) {
      setStep(3)
    } else if (validCategory) {
      setStep(2)
    }
  }, [validCategory, selectedBrand, selectedModel])

  // Función para actualizar datos del formulario
  const updateFormData = (key, value) => {
    setFormData(prevState => ({
      ...prevState,
      [key]: value
    }))
  }

  // Efecto para gestionar la visualización de detalles adicionales
  useEffect(() => {
    const requiresAdditionalDetails = additionalDetailsConfig.some(
      detail => detail.categoryId === formData.category.id
    )
    setShowAdditionalDetails(requiresAdditionalDetails)
  }, [formData.category])

  // Manejar paso siguiente y paso anterior
  const handleNextStep = () => {
    setStep(prevStep => prevStep + 1)
  }

  const handlePrevStep = () => {
    if(showAdditionalDetails) {
      setStep(prevStep => prevStep - 1)
      setShowAdditionalDetails(false)
    } else {
      setStep(prevStep => prevStep - 1)
    }
  }

  // Confirmación de detalles adicionales
  const handleAdditionalDetailsConfirm = () => {
    setShowAdditionalDetails(false)
  }  

  // Envío del formulario
  const handleSubmit = async () => {
    const date = new Date(new Date().getTime() - (3 * 60 * 60 * 1000))
    const updatedFormData = { ...formData, date }

    try {
      const response = await fetch(`${getApiUrl()}/api/quotes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text}`)
      }

      const responseData = await response.json()

      if (!response.ok) {
        console.error('Form submission failed', responseData)
        setSubmitStatus('error')
        return
      }

      setFormData(prevState => ({
        ...prevState,
        userData: {
          ...prevState.userData,
          customerNumber: responseData.customerNumber,
          serviceRequestNumber: responseData.serviceRequestNumber,
          firstName: updatedFormData.userData.firstName
        }
      }))
      setSubmitStatus('success')
    } catch (error) {
      //console.error('Error submitting form:', error)
      logError(`Error al enviar Cotización: ${error.message || JSON.stringify(error)}`)
      setSubmitStatus('error')
    }
  }

  // Llamar al envío cuando el ultimo paso
  useEffect(() => {
    if (step === steps.length + 1) {
      handleSubmit()
    }
  }, [step])

  // 🔹 Redirigir a /confirmacion cuando termina el submit
  useEffect(() => {
    if (submitStatus === 'success' || submitStatus === 'error') {
      navigate('/confirmacion', {
        state: {
          status: submitStatus,
          name: formData.userData.firstName,
          customerNumber: formData.userData.customerNumber,
          serviceRequestNumber: formData.userData.serviceRequestNumber
        }
      })
    }
  }, [submitStatus, formData, navigate])

  return (
    <>
      <Helmet>
        <title>Reparación de Electrodomésticos en Quilmes | Electrosafe</title>
        <meta name="description" content="Cotizá online la reparación de Televisores, heladeras, Microondas y más. Servicio técnico en Quilmes con garantía y diagnóstico gratis." />
        <meta property="og:title" content="Service de Electrodomésticos | Electrosafe" />
        <meta property="og:description" content="Solicitá tu reparación online en 1 minutos. Retiro a domicilio o en nuestras sucursales." />
        <meta property="og:image" content="https://electrosafeweb.com/logo.png" />
        <meta property="og:url" content="https://electrosafeweb.com/reparacion-electrodomesticos" />
      </Helmet>

      <div className="services">
        <ProgressBar step={step} handlePrevStep={handlePrevStep} />
        {step === 1 && !showAdditionalDetails && <CategorySelection nextStep={handleNextStep} updateFormData={updateFormData} />}
        {step === 2 && !showAdditionalDetails && <BrandSelection selectedCategory={formData.category} nextStep={handleNextStep} handlePrevStep={handlePrevStep} updateFormData={updateFormData} />}
        {step === 3 && !showAdditionalDetails && <ModelSelection selectedCategory={formData.category} brand={formData.brand} nextStep={handleNextStep} handlePrevStep={handlePrevStep} updateFormData={updateFormData} />}
        {step === 4 && !showAdditionalDetails && <FaultSelection selectedCategory={formData.category} formData={formData} nextStep={handleNextStep} handlePrevStep={handlePrevStep} updateFormData={updateFormData} />}
        {step === 5 && !showAdditionalDetails && <InformationForm nextStep={handleNextStep} handlePrevStep={handlePrevStep} updateFormData={updateFormData} />}
        {step === 6 && !showAdditionalDetails && <ServiceSelection selectedProvince={formData.userData.province} selectedMunicipio={formData.userData.municipio} selectedCategory={formData.category.id} nextStep={handleNextStep} handlePrevStep={handlePrevStep} updateFormData={updateFormData} />}
        {step === 7 && !showAdditionalDetails && <FormSubmissionStatus status={submitStatus} name={formData.userData.firstName} customerNumber={formData.userData.customerNumber} serviceRequestNumber={formData.userData.serviceRequestNumber} />}
        {showAdditionalDetails && <AdditionalDetailsStep onConfirm={handleAdditionalDetailsConfirm} updateFormData={updateFormData} categoryId={formData.category.id} />}
      </div>
    </>
  )
}

export default Services
