const getApiUrl = () => {
    return process.env.NODE_ENV === 'production' // production development
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_DEV_API_URL || 'http://localhost:5000'
}

const getPublicAppUrl = () => {
    return process.env.REACT_APP_PUBLIC_APP_URL || window.location.origin
}

export { getApiUrl, getPublicAppUrl }
