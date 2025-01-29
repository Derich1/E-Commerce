
export default function Footer(){

    return(
        <>
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-center">Sobre Nós</h3>
                        <p>
                        Somos uma empresa dedicada a fornecer os melhores produtos e serviços. 
                        Nosso objetivo é sua satisfação!
                        </p>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-semibold mb-4 text-center">Contato</h3>
                        <p className="text-center">Email: contato@empresa.com</p>
                        <p className="text-center">Telefone: (11) 99999-9999</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-center">Redes Sociais</h3>
                        <div className="text-center space-x-4">
                            <a href="#" className="text-blue-400 hover:text-blue-600">Facebook</a>
                            <a href="#" className="text-blue-400 hover:text-blue-600">Twitter</a>
                            <a href="#" className="text-pink-400 hover:text-pink-600">Instagram</a>
                        </div>
                    </div>
                    </div>

                    <div className="footer-bottom mt-8 border-t border-gray-700 pt-4">
                    <p className="text-center text-sm">&copy; {new Date().getFullYear()} Empresa. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

        </>
    )
}