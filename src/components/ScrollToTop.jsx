import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function ScrollToTop() {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (!location.hash) {
            window.scrollTo(0, 0)
        }
    }, [location.pathname, location.hash])

    return null
}

export default ScrollToTop
