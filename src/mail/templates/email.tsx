import {
    Tailwind,
    Html,
    Body,
    Container,
    Text,
    Preview,
    Link,
    Head,
    Font,
    Img,
    Section,
} from "@react-email/components"

type EmailProps = {
    email: string
    authLink: string
}

export function Email({
    email = "felipemmaciel06@gmail.com",
    authLink = "https://mblog.com/confirm/JAsHSKJHfkasdfDSJKflF",
}: EmailProps) {
    return (
        <Html>
            <Tailwind>
                <Head>
                    <Font
                        fontFamily="Inter"
                        fallbackFontFamily="Arial"
                        webFont={{
                            url: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
                            format: "woff2",
                        }}
                    />
                </Head>
                <Body className="font-sans">
                    <Preview>Faça login no MBlog</Preview>
                    <Container
                        className="p-4 rounded"
                        style={{ border: "1px solid rgba(0,0,0,.2)" }}
                    >
                        <Img
                            src="https://i.imgur.com/qmqxT5d.png"
                            className="m-auto mb-6"
                        ></Img>
                        <Section
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2rem",
                            }}
                        >
                            <Text className="text-3xl font-bold text-center">
                                Olá, usuário novo!
                            </Text>
                            <Text>
                                Um email de verificação para {email} foi
                                solicitado. Se não foi você que solicitou,
                                ignore esta mensagem.
                            </Text>
                            <Container className="text-center">
                                <Text>
                                    Se foi mesmo você, acesse o botão abaixo
                                    para se cadastrar na plataforma.
                                </Text>
                                <Link
                                    className="my-6 px-2 py-3.5 font-semibold bg-sky-500 text-white rounded hover:bg-sky-600"
                                    href={authLink}
                                >
                                    Acesse aqui
                                </Link>
                                <Text>
                                    ...ou copie e cole este link no seu
                                    navegador:
                                </Text>
                                <Text className="text-sky-500">{authLink}</Text>
                            </Container>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
