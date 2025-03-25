
export default function Footer(){

    return(
        <>
            <footer className="bg-rose-200 max-h-[400px] text-white py-4">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-semibold mb-1 text-center">Sobre Nós</h3>
                        <p className="text-sm text-center">
                        Somos uma empresa dedicada a fornecer os melhores produtos e serviços. 
                        Nosso objetivo é sua satisfação!
                        </p>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-sm font-semibold mb-1 text-center">Contato</h3>
                        <p className="text-center text-sm">Email: contato@empresa.com</p>
                        <p className="text-center text-sm">Telefone: (11) 99999-9999</p>
                    </div>
                    </div>
                </div>
            </footer>

        </>
    )
}