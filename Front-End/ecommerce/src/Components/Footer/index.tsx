import "./index.css"

export default function Footer(){

    return(
        <>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                    <h3>Sobre Nós</h3>
                    <p>
                        Somos uma empresa dedicada a fornecer os melhores produtos e serviços. 
                        Nosso objetivo é sua satisfação!
                    </p>
                    </div>
                    <div className="footer-section">
                    <h3>Contato</h3>
                    <p>Email: contato@empresa.com</p>
                    <p>Telefone: (11) 99999-9999</p>
                    </div>
                    <div className="footer-section">
                        <h3>Redes Sociais</h3>
                        <div className="social-links">
                            <a href="#">Facebook</a>
                            <a href="#">Twitter</a>
                            <a href="#">Instagram</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Empresa. Todos os direitos reservados.</p>
                    </div>
                </div>

                
            </footer>

        </>
    )
}