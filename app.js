
const telaAcesso =
    document.getElementById("tela-acesso");

const appPrincipal =
    document.getElementById("app-principal");

const opcoesAcesso =
    document.getElementById("opcoes-acesso");

const formLogin =
    document.getElementById("form-login");

const formCadastro =
    document.getElementById("form-cadastro");

const abrirLogin =
    document.getElementById("abrir-login");

const abrirCadastro =
    document.getElementById("abrir-cadastro");

const voltarLogin =
    document.getElementById("voltar-login");

const voltarCadastro =
    document.getElementById("voltar-cadastro");

const btnEntrar =
    document.getElementById("btn-entrar");

const btnCadastrar =
    document.getElementById("btn-cadastrar");

const btnSair =
    document.getElementById("btn-sair");

const saudacaoUsuario =
    document.getElementById("saudacao-usuario");


// ========================================
// UTILIDADES
// ========================================

function limparTelefone(telefone) {

    return telefone.replace(/\D/g, "");

}


async function gerarHashPIN(pin) {

    const dados =
        new TextEncoder().encode(pin);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            dados
        );

    return Array.from(
        new Uint8Array(hash)
    )
        .map(function (byte) {

            return byte
                .toString(16)
                .padStart(2, "0");

        })
        .join("");

}


// ========================================
// USUÁRIOS
// ========================================

function obterUsuarios() {

    return JSON.parse(
        localStorage.getItem(
            "marisca_usuarios"
        )
    ) || [];

}


function salvarUsuarios(usuarios) {

    localStorage.setItem(
        "marisca_usuarios",
        JSON.stringify(usuarios)
    );

}


// ========================================
// ABRIR LOGIN
// ========================================

abrirLogin.addEventListener(
    "click",
    function () {

        opcoesAcesso.classList.add(
            "oculto"
        );

        formCadastro.classList.add(
            "oculto"
        );

        formLogin.classList.remove(
            "oculto"
        );

    }
);


// ========================================
// ABRIR CADASTRO
// ========================================

abrirCadastro.addEventListener(
    "click",
    function () {

        opcoesAcesso.classList.add(
            "oculto"
        );

        formLogin.classList.add(
            "oculto"
        );

        formCadastro.classList.remove(
            "oculto"
        );

    }
);


// ========================================
// VOLTAR
// ========================================

voltarLogin.addEventListener(
    "click",
    voltarTelaInicial
);

voltarCadastro.addEventListener(
    "click",
    voltarTelaInicial
);


function voltarTelaInicial() {

    formLogin.classList.add(
        "oculto"
    );

    formCadastro.classList.add(
        "oculto"
    );

    opcoesAcesso.classList.remove(
        "oculto"
    );

}


// ========================================
// CADASTRAR
// ========================================

btnCadastrar.addEventListener(
    "click",
    async function () {

        const nome =
            document
                .getElementById(
                    "cadastro-nome"
                )
                .value
                .trim();

        const telefone =
            limparTelefone(
                document
                    .getElementById(
                        "cadastro-telefone"
                    )
                    .value
            );

        const pin =
            document
                .getElementById(
                    "cadastro-pin"
                )
                .value;


        if (
            !nome ||
            !telefone ||
            !pin
        ) {

            alert(
                "Preencha nome, telefone e PIN."
            );

            return;

        }


        if (
            pin.length < 4 ||
            pin.length > 6 ||
            !/^\d+$/.test(pin)
        ) {

            alert(
                "O PIN deve ter de 4 a 6 números."
            );

            return;

        }


        let usuarios =
            obterUsuarios();


        const usuarioExiste =
            usuarios.some(
                function (usuario) {

                    return (
                        usuario.telefone ===
                        telefone
                    );

                }
            );


        if (usuarioExiste) {

            alert(
                "Já existe um perfil com esse telefone."
            );

            return;

        }


        const pinHash =
            await gerarHashPIN(pin);


        const novoUsuario = {

            nome,

            telefone,

            pinHash

        };


        usuarios.push(
            novoUsuario
        );


        salvarUsuarios(
            usuarios
        );


        localStorage.setItem(
            "marisca_usuario_ativo",
            telefone
        );


        alert(
            "Perfil criado com sucesso!"
        );


        abrirAplicativo(
            novoUsuario
        );

    }
);


// ========================================
// ENTRAR
// ========================================

btnEntrar.addEventListener(
    "click",
    async function () {

        const telefone =
            limparTelefone(
                document
                    .getElementById(
                        "login-telefone"
                    )
                    .value
            );

        const pin =
            document
                .getElementById(
                    "login-pin"
                )
                .value;


        const usuarios =
            obterUsuarios();


        const usuario =
            usuarios.find(
                function (item) {

                    return (
                        item.telefone ===
                        telefone
                    );

                }
            );


        if (!usuario) {

            alert(
                "Perfil não encontrado."
            );

            return;

        }


        const pinHash =
            await gerarHashPIN(pin);


        if (
            pinHash !==
            usuario.pinHash
        ) {

            alert(
                "PIN incorreto."
            );

            return;

        }


        localStorage.setItem(
            "marisca_usuario_ativo",
            telefone
        );


        abrirAplicativo(
            usuario
        );

    }
);


// ========================================
// ABRIR MARISCA
// ========================================

function abrirAplicativo(usuario) {

    telaAcesso.classList.add(
        "oculto"
    );

    appPrincipal.classList.remove(
        "oculto"
    );


    saudacaoUsuario.textContent =
        `Olá, ${usuario.nome}!`;

}


// ========================================
// SAIR
// ========================================

btnSair.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "marisca_usuario_ativo"
        );


        appPrincipal.classList.add(
            "oculto"
        );

        telaAcesso.classList.remove(
            "oculto"
        );


        voltarTelaInicial();

    }
);


// ========================================
// VERIFICAR SESSÃO AO ABRIR
// ========================================

(function verificarSessao() {

    const telefone =
        localStorage.getItem(
            "marisca_usuario_ativo"
        );


    if (!telefone) {

        return;

    }


    const usuario =
        obterUsuarios().find(
            function (item) {

                return (
                    item.telefone ===
                    telefone
                );

            }
        );


    if (usuario) {

        abrirAplicativo(
            usuario
        );

    }

})();
// ========================================
// PRODUÇÕES DE CADA MARISQUEIRA
// ========================================
function chaveProducoes() {
    const telefone =
        localStorage.getItem("marisca_usuario_ativo");

    return `producoes_${telefone}`;
}
// ========================================
// ELEMENTOS PRINCIPAIS
// ========================================

const botaoRegistro =
    document.getElementById("btn-registro");

const botaoPendentes =
    document.getElementById("btn-pendentes");

const botaoProducao =
    document.getElementById("btn-producao");

const botaoAmbiente =
    document.getElementById("btn-ambiente");

const formularioProducao =
    document.getElementById("form-producao");

const listaPendentes =
    document.getElementById("lista-pendentes");

const listaProducao =
    document.getElementById("lista-producao");

const painelAmbiente =
    document.getElementById("painel-ambiente");

const botaoSalvar =
    document.getElementById("salvar-producao");

const botaoCancelar =
    document.getElementById("cancelar-producao");

const fecharPendentes =
    document.getElementById("fechar-pendentes");

const fecharProducao =
    document.getElementById("fechar-producao");

const fecharAmbiente =
    document.getElementById("fechar-ambiente");


// ========================================
// CAMPOS DO FORMULÁRIO
// ========================================

const quantidadeCaixas =
    document.getElementById("quantidade-caixas");

const horasTrabalho =
    document.getElementById("horas-trabalho");

const tamanhoSacola =
    document.getElementById("tamanho-sacola");

const campoSacolaOutro =
    document.getElementById("campo-sacola-outro");

const pesoSacolaOutro =
    document.getElementById("peso-sacola-outro");

const sacolasPorCaixa =
    document.getElementById("sacolas-por-caixa");

const vendeuTodas =
    document.getElementById("vendeu-todas");

const campoSobras =
    document.getElementById("campo-sobras");

const sacolasSobraram =
    document.getElementById("sacolas-sobraram");

const precoSacola =
    document.getElementById("preco-sacola");

const resumoCalculado =
    document.getElementById("resumo-calculado");


// ========================================
// ÁREAS DE RESULTADO
// ========================================

const registrosPendentes =
    document.getElementById("registros-pendentes");

const resumosProducao =
    document.getElementById("resumos-producao");

const dadosTempo =
    document.getElementById("dados-tempo");

const dadosMare =
    document.getElementById("dados-mare");


// ========================================
// FILTROS
// ========================================

const filtroDia =
    document.getElementById("filtro-dia");

const filtroMes =
    document.getElementById("filtro-mes");

const mostrarTodas =
    document.getElementById("mostrar-todas");


// ========================================
// ABRIR TELAS
// ========================================

botaoRegistro.addEventListener("click", function () {

    listaPendentes.classList.add("oculto");
    listaProducao.classList.add("oculto");
    painelAmbiente.classList.add("oculto");

    formularioProducao.classList.remove("oculto");

});


botaoPendentes.addEventListener("click", function () {

    formularioProducao.classList.add("oculto");
    listaProducao.classList.add("oculto");
    painelAmbiente.classList.add("oculto");

    listaPendentes.classList.remove("oculto");

    mostrarPendentes();

});


botaoProducao.addEventListener("click", function () {

    formularioProducao.classList.add("oculto");
    listaPendentes.classList.add("oculto");
    painelAmbiente.classList.add("oculto");

    listaProducao.classList.remove("oculto");

    mostrarResumo();

});


botaoAmbiente.addEventListener("click", function () {

    formularioProducao.classList.add("oculto");
    listaPendentes.classList.add("oculto");
    listaProducao.classList.add("oculto");

    painelAmbiente.classList.remove("oculto");

    carregarMare();
    carregarTempo();

});


botaoCancelar.addEventListener("click", function () {

    formularioProducao.classList.add("oculto");

});


fecharPendentes.addEventListener("click", function () {

    listaPendentes.classList.add("oculto");

});


fecharProducao.addEventListener("click", function () {

    listaProducao.classList.add("oculto");

});


fecharAmbiente.addEventListener("click", function () {

    painelAmbiente.classList.add("oculto");

});


// ========================================
// TAMANHO DA SACOLINHA
// ========================================

tamanhoSacola.addEventListener("change", function () {

    if (tamanhoSacola.value === "outro") {

        campoSacolaOutro.classList.remove("oculto");

    } else {

        campoSacolaOutro.classList.add("oculto");
        pesoSacolaOutro.value = "";

    }

    calcularResumoAutomatico();

});


function obterPesoSacola() {

    if (tamanhoSacola.value === "outro") {

        return Number(pesoSacolaOutro.value) || 0;

    }

    return Number(tamanhoSacola.value) || 0;

}


// ========================================
// VENDEU TODAS?
// ========================================

vendeuTodas.addEventListener("change", function () {

    if (vendeuTodas.value === "nao") {

        campoSobras.classList.remove("oculto");

    } else {

        campoSobras.classList.add("oculto");
        sacolasSobraram.value = "";

    }

    calcularResumoAutomatico();

});


// ========================================
// RECALCULAR AUTOMATICAMENTE
// ========================================

[
    quantidadeCaixas,
    horasTrabalho,
    pesoSacolaOutro,
    sacolasPorCaixa,
    sacolasSobraram,
    precoSacola

].forEach(function (elemento) {

    elemento.addEventListener(
        "input",
        calcularResumoAutomatico
    );

});


// ========================================
// RESUMO AUTOMÁTICO
// ========================================

function calcularResumoAutomatico() {

    const caixas =
        Number(quantidadeCaixas.value) || 0;

    const sacolasCaixa =
        Number(sacolasPorCaixa.value) || 0;

    const preco =
        Number(precoSacola.value) || 0;

    const pesoSacola =
        obterPesoSacola();

    const totalSacolas =
        caixas * sacolasCaixa;


    let quantidadeSobras = 0;

    if (vendeuTodas.value === "nao") {

        quantidadeSobras =
            Number(sacolasSobraram.value) || 0;

    }


    if (quantidadeSobras > totalSacolas) {

        quantidadeSobras = totalSacolas;

    }


    const vendidas =
        totalSacolas - quantidadeSobras;

    const pendentes =
        quantidadeSobras;

    const kgProduzidos =
        (totalSacolas * pesoSacola) / 1000;

    const kgVendidos =
        (vendidas * pesoSacola) / 1000;

    const kgPendentes =
        (pendentes * pesoSacola) / 1000;

    const receita =
        vendidas * preco;


    if (
        caixas === 0 &&
        sacolasCaixa === 0
    ) {

        resumoCalculado.classList.add("oculto");

        return;

    }


    resumoCalculado.innerHTML = `

        <strong>Resumo automático</strong>

        <p>
            🧺 Caixas/galeias trabalhadas:
            ${caixas.toFixed(2)}
        </p>

        <p>
            🛍️ Sacolinhas produzidas:
            ${totalSacolas.toFixed(2)}
        </p>

        <p>
            ⚖️ Produção equivalente:
            ${kgProduzidos.toFixed(2)} kg
        </p>

        <p>
            ✅ Sacolinhas vendidas:
            ${vendidas.toFixed(2)}
        </p>

        <p>
            📦 Sacolinhas pendentes:
            ${pendentes.toFixed(2)}
        </p>

        <p>
            ⚖️ Peso vendido:
            ${kgVendidos.toFixed(2)} kg
        </p>

        <p>
            ⚖️ Peso pendente:
            ${kgPendentes.toFixed(2)} kg
        </p>

        <p>
            💰 Receita desta venda:
            R$ ${receita.toFixed(2)}
        </p>
    `;


    resumoCalculado.classList.remove("oculto");

}


// ========================================
// SALVAR PRODUÇÃO
// ========================================

botaoSalvar.addEventListener("click", function () {

    const data =
        document.getElementById("data-producao").value;

    const caixas =
        Number(quantidadeCaixas.value);

    const horas =
        Number(horasTrabalho.value) || 0;

    const pesoSacola =
        obterPesoSacola();

    const sacolasCaixa =
        Number(sacolasPorCaixa.value);

    const preco =
        Number(precoSacola.value) || 0;

    const observacao =
        document.getElementById("observacao-producao").value;


    if (
        !data ||
        !caixas ||
        !pesoSacola ||
        !sacolasCaixa
    ) {

        alert(
            "Preencha data, caixas/galeias, tamanho da sacolinha e sacolinhas por caixa."
        );

        return;

    }


    if (!vendeuTodas.value) {

        alert(
            "Informe se todas as sacolinhas foram vendidas."
        );

        return;

    }


    const totalSacolas =
        caixas * sacolasCaixa;


    let quantidadeSobras = 0;

    if (vendeuTodas.value === "nao") {

        if (sacolasSobraram.value === "") {

            alert(
                "Informe quantas sacolinhas sobraram."
            );

            return;

        }

        quantidadeSobras =
            Number(sacolasSobraram.value) || 0;

    }


    if (quantidadeSobras > totalSacolas) {

        alert(
            "A quantidade de sacolinhas que sobraram não pode ser maior que a produção."
        );

        return;

    }


    const vendidasAgora =
        totalSacolas - quantidadeSobras;

    const pendentes =
        quantidadeSobras;

    const pesoProduzidoKg =
        (totalSacolas * pesoSacola) / 1000;

    const pesoVendidoKg =
        (vendidasAgora * pesoSacola) / 1000;

    const pesoPendenteKg =
        (pendentes * pesoSacola) / 1000;

    const receitaInicial =
        vendidasAgora * preco;


    const registro = {

        id: Date.now(),

        data,

        quantidadeCaixas:
            caixas,

        horasTrabalho:
            horas,

        pesoSacola,

        sacolasPorCaixa:
            sacolasCaixa,

        sacolasProduzidas:
            totalSacolas,

        pesoProduzidoKg,

        vendeuTodas:
            vendeuTodas.value,

        quantidadeSobras,

        sacolasVendidas:
            vendidasAgora,

        sacolasPendentes:
            pendentes,

        pesoVendidoKg,

        pesoPendenteKg,

        precoSacola:
            preco,

        receita:
            receitaInicial,

        vendasPosteriores: [],

        observacao

    };


    let producoes =
        JSON.parse(
            localStorage.getItem(     chaveProducoes() )
        ) || [];


    producoes.push(registro);


    localStorage.setItem(
    chaveProducoes(),
    JSON.stringify(producoes)
);


    alert(
        "Produção registrada com sucesso!"
    );


    limparFormulario();

    formularioProducao.classList.add("oculto");

});


// ========================================
// MOSTRAR VENDAS PENDENTES
// ========================================

function mostrarPendentes() {

    const producoes =
        JSON.parse(
            localStorage.getItem(     chaveProducoes() )
        ) || [];


    registrosPendentes.innerHTML = "";


    const pendentes =
        producoes.filter(function (registro) {

            return Number(registro.sacolasPendentes) > 0;

        });


    if (pendentes.length === 0) {

        registrosPendentes.innerHTML =
            "<p>Não há vendas pendentes.</p>";

        return;

    }


    pendentes.forEach(function (registro) {

        const card =
            document.createElement("div");

        card.classList.add("resumo-producao");


        card.innerHTML = `

            <h3>🛍️ Venda pendente</h3>

            <p>
                📅 Produção de:
                ${formatarData(registro.data)}
            </p>

            <p>
                📦 <strong>Sacolinhas disponíveis:</strong>
                ${Number(registro.sacolasPendentes).toFixed(2)}
            </p>

            <p>
                ⚖️ <strong>Peso equivalente:</strong>
                ${Number(registro.pesoPendenteKg).toFixed(2)} kg
            </p>

            <label>
                Quantas foram vendidas agora?
            </label>

            <input
                type="number"
                id="venda-${registro.id}"
                min="0"
                step="0.01"
            >

            <label>
                Valor por sacolinha (R$)
            </label>

            <input
                type="number"
                id="preco-${registro.id}"
                min="0"
                step="0.01"
            >

            <button
                onclick="registrarVendaPendente(${registro.id})"
            >
                Registrar venda
            </button>
        `;


        registrosPendentes.appendChild(card);

    });

}


// ========================================
// REGISTRAR VENDA POSTERIOR
// ========================================

function registrarVendaPendente(id) {

    let producoes =
        JSON.parse(
            localStorage.getItem(     chaveProducoes() )
        ) || [];


    const indice =
        producoes.findIndex(function (registro) {

            return registro.id === id;

        });


    if (indice === -1) {

        return;

    }


    const registro =
        producoes[indice];


    const quantidade =
        Number(
            document.getElementById(
                `venda-${id}`
            ).value
        );


    const preco =
        Number(
            document.getElementById(
                `preco-${id}`
            ).value
        );


    if (
        !quantidade ||
        !preco
    ) {

        alert(
            "Informe a quantidade vendida e o valor da sacolinha."
        );

        return;

    }


    if (
        quantidade >
        Number(registro.sacolasPendentes)
    ) {

        alert(
            "Você não pode vender mais sacolinhas do que estão disponíveis."
        );

        return;

    }


    const receitaVenda =
        quantidade * preco;


    const pesoVenda =
        (quantidade * registro.pesoSacola) / 1000;


    registro.sacolasVendidas =
        Number(registro.sacolasVendidas) +
        quantidade;


    registro.sacolasPendentes =
        Number(registro.sacolasPendentes) -
        quantidade;


    registro.pesoVendidoKg =
        Number(registro.pesoVendidoKg) +
        pesoVenda;


    registro.pesoPendenteKg =
        (
            registro.sacolasPendentes *
            registro.pesoSacola
        ) / 1000;


    registro.receita =
        Number(registro.receita) +
        receitaVenda;


    registro.vendasPosteriores.push({

        dataVenda:
            new Date().toISOString(),

        quantidade,

        preco,

        pesoKg:
            pesoVenda,

        receita:
            receitaVenda

    });


    producoes[indice] =
        registro;


   localStorage.setItem(
    chaveProducoes(),
    JSON.stringify(producoes)
);


    alert(
        "Venda registrada com sucesso!"
    );


    mostrarPendentes();

}


// ========================================
// FILTROS DA PRODUÇÃO
// ========================================

filtroDia.addEventListener(
    "change",
    aplicarFiltros
);

filtroMes.addEventListener(
    "change",
    aplicarFiltros
);


mostrarTodas.addEventListener("click", function () {

    filtroDia.value = "";

    filtroMes.value = "";

    mostrarResumo();

});


function aplicarFiltros() {

    mostrarResumo(
        filtroDia.value,
        filtroMes.value
    );

}


// ========================================
// RESUMO DA PRODUÇÃO
// ========================================

function mostrarResumo(
    dia = "",
    mes = ""
) {

    let producoes =
        JSON.parse(
            localStorage.getItem(     chaveProducoes() )
        ) || [];


    resumosProducao.innerHTML = "";


    if (dia) {

        producoes =
            producoes.filter(function (registro) {

                return registro.data === dia;

            });

    }


    if (mes) {

        producoes =
            producoes.filter(function (registro) {

                return registro.data.startsWith(mes);

            });

    }


    if (producoes.length === 0) {

        resumosProducao.innerHTML =
            "<p>Nenhuma produção encontrada para esse período.</p>";

        return;

    }


    let totalCaixas = 0;

    let totalHoras = 0;

    let produzidas = 0;

    let vendidas = 0;

    let pendentes = 0;

    let pesoProduzido = 0;

    let pesoVendido = 0;

    let pesoPendente = 0;

    let receita = 0;


    const dias =
        new Set();

    const meses =
        new Set();


    producoes.forEach(function (registro) {

        totalCaixas +=
            Number(registro.quantidadeCaixas) || 0;

        totalHoras +=
            Number(registro.horasTrabalho) || 0;

        produzidas +=
            Number(registro.sacolasProduzidas) || 0;

        vendidas +=
            Number(registro.sacolasVendidas) || 0;

        pendentes +=
            Number(registro.sacolasPendentes) || 0;

        pesoProduzido +=
            Number(registro.pesoProduzidoKg) || 0;

        pesoVendido +=
            Number(registro.pesoVendidoKg) || 0;

        pesoPendente +=
            Number(registro.pesoPendenteKg) || 0;

        receita +=
            Number(registro.receita) || 0;


        dias.add(
            registro.data
        );


        meses.add(
            registro.data.substring(0, 7)
        );

    });


    const mediaCaixasDia =
        dias.size > 0
            ? totalCaixas / dias.size
            : 0;


    const mediaCaixasMes =
        meses.size > 0
            ? totalCaixas / meses.size
            : 0;


    const mediaReceitaDia =
        dias.size > 0
            ? receita / dias.size
            : 0;


    const mediaReceitaMes =
        meses.size > 0
            ? receita / meses.size
            : 0;


    resumosProducao.innerHTML = `

        <div class="resumo-producao">

            <h3>🦪 Resumo Sururu</h3>

            <h4>Produção</h4>

            <p>
                🧺 <strong>Total de caixas/galeias:</strong>
                ${totalCaixas.toFixed(2)}
            </p>

            <p>
                📅 <strong>Média de caixas por dia:</strong>
                ${mediaCaixasDia.toFixed(2)}
            </p>

            <p>
                🗓️ <strong>Média de caixas por mês:</strong>
                ${mediaCaixasMes.toFixed(2)}
            </p>

            <p>
                🛍️ <strong>Sacolinhas produzidas:</strong>
                ${produzidas.toFixed(2)}
            </p>

            <p>
                ⚖️ <strong>Produção equivalente:</strong>
                ${pesoProduzido.toFixed(2)} kg
            </p>

            <p>
                ⏱️ <strong>Horas de trabalho:</strong>
                ${totalHoras.toFixed(2)} h
            </p>

            <p>
                📆 <strong>Dias trabalhados:</strong>
                ${dias.size}
            </p>


            <h4>Comercialização</h4>

            <p>
                ✅ <strong>Sacolinhas vendidas:</strong>
                ${vendidas.toFixed(2)}
            </p>

            <p>
                📦 <strong>Sacolinhas pendentes:</strong>
                ${pendentes.toFixed(2)}
            </p>

            <p>
                ⚖️ <strong>Peso vendido:</strong>
                ${pesoVendido.toFixed(2)} kg
            </p>

            <p>
                ⚖️ <strong>Peso pendente:</strong>
                ${pesoPendente.toFixed(2)} kg
            </p>

            <p>
                💰 <strong>Receita total:</strong>
                R$ ${receita.toFixed(2)}
            </p>

            <p>
                📅 <strong>Receita média por dia:</strong>
                R$ ${mediaReceitaDia.toFixed(2)}
            </p>

            <p>
                🗓️ <strong>Receita média por mês:</strong>
                R$ ${mediaReceitaMes.toFixed(2)}
            </p>

        </div>
    `;

}


// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {

    const partes =
        data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ========================================
// PREVISÃO DO TEMPO
// ========================================

async function carregarTempo() {

    dadosTempo.innerHTML =
        "<p>Carregando previsão...</p>";


    const latitude = -20.34;

    const longitude = -40.38;


    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
        `&hourly=precipitation_probability` +
        `&timezone=America%2FSao_Paulo`;


    try {

        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar a previsão."
            );

        }


        const dados =
            await resposta.json();


        const atual =
            dados.current;


        const temperatura =
            atual.temperature_2m;


        const chuva =
            atual.precipitation;


        const vento =
            atual.wind_speed_10m;


        const direcao =
            converterDirecaoVento(
                atual.wind_direction_10m
            );


        const probabilidadeChuva =
            obterProbabilidadeAtual(
                dados
            );


        dadosTempo.innerHTML = `

            <div class="card-ambiente">

                <h3>Agora</h3>

                <p>
                    🌡️ <strong>Temperatura:</strong>
                    ${temperatura} °C
                </p>

                <p>
                    🌧️ <strong>Chuva:</strong>
                    ${chuva} mm
                </p>

                <p>
                    ☔ <strong>Probabilidade de chuva:</strong>
                    ${probabilidadeChuva}%
                </p>

                <p>
                    💨 <strong>Vento:</strong>
                    ${vento} km/h
                </p>

                <p>
                    🧭 <strong>Direção:</strong>
                    ${direcao}
                </p>

            </div>

            <p class="fonte-dados">
                Dados meteorológicos: Open-Meteo
            </p>
        `;


    } catch (erro) {

        dadosTempo.innerHTML = `

            <p>
                Não foi possível carregar a previsão agora.
                Verifique sua conexão com a internet.
            </p>
        `;

        console.error(
            "Erro ao carregar previsão:",
            erro
        );

    }

}


// ========================================
// DIREÇÃO DO VENTO
// ========================================

function converterDirecaoVento(graus) {

    const direcoes = [
        "N",
        "NE",
        "L",
        "SE",
        "S",
        "SO",
        "O",
        "NO"
    ];


    const indice =
        Math.round(graus / 45) % 8;


    return direcoes[indice];

}


// ========================================
// PROBABILIDADE DE CHUVA
// ========================================

function obterProbabilidadeAtual(dados) {

    if (
        !dados.hourly ||
        !dados.hourly.time ||
        !dados.hourly.precipitation_probability
    ) {

        return "-";

    }


    const agora =
        new Date();


    const horaAtual =
        agora.toISOString().slice(0, 13);


    const indice =
        dados.hourly.time.findIndex(function (hora) {

            return hora.startsWith(horaAtual);

        });


    if (indice === -1) {

        return "-";

    }


    return (
        dados.hourly
            .precipitation_probability[indice]
        ?? "-"
    );

}


// ========================================
// MARÉ
// ========================================

async function carregarMare() {

    dadosMare.innerHTML =
        "<p>Carregando maré...</p>";


    try {

        const resposta =
            await fetch("mares-2026.json");


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar a tábua de marés."
            );

        }


        const mares =
            await resposta.json();


        const hoje =
            new Date();


        const ano =
            hoje.getFullYear();


        const mes =
            String(
                hoje.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                hoje.getDate()
            ).padStart(2, "0");


        const dataHoje =
            `${ano}-${mes}-${dia}`;


        const registroHoje =
            mares.find(function (registro) {

                return registro.data === dataHoje;

            });


        if (!registroHoje) {

            dadosMare.innerHTML = `

                <div class="card-ambiente">

                    <h3>🌊 Maré</h3>

                    <p>
                        Não há previsão de maré disponível para esta data.
                    </p>

                </div>
            `;

            return;

        }


        let htmlMares = "";


        registroHoje.mares.forEach(function (mare) {

            let simbolo = "🌊";


            if (mare.tipo === "alta") {

                simbolo = "⬆️";

            }


            if (mare.tipo === "baixa") {

                simbolo = "⬇️";

            }


            htmlMares += `

                <div class="linha-mare">

                    <span>
                        ${simbolo}
                        ${mare.tipo === "alta"
                            ? "Preia-mar"
                            : "Baixa-mar"}
                    </span>

                    <strong>
                        ${mare.hora}
                    </strong>

                    <span>
                        ${Number(mare.altura).toFixed(2)} m
                    </span>

                </div>
            `;

        });


        dadosMare.innerHTML = `

            <div class="card-ambiente">

                <h3>🌊 Maré de hoje</h3>

                ${htmlMares}

            </div>

            <p class="fonte-dados">
                Fonte: Marinha do Brasil – CHM
                • Porto de Vitória
            </p>
        `;


    } catch (erro) {

        dadosMare.innerHTML = `

            <p>
                Não foi possível carregar a previsão da maré.
            </p>
        `;


        console.error(
            "Erro ao carregar maré:",
            erro
        );

    }

}


// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function limparFormulario() {

    document.getElementById(
        "data-producao"
    ).value = "";


    quantidadeCaixas.value = "";


    horasTrabalho.value = "";


    tamanhoSacola.value = "";


    pesoSacolaOutro.value = "";


    sacolasPorCaixa.value = "";


    vendeuTodas.value = "";


    sacolasSobraram.value = "";


    precoSacola.value = "";


    document.getElementById(
        "observacao-producao"
    ).value = "";


    campoSacolaOutro.classList.add(
        "oculto"
    );


    campoSobras.classList.add(
        "oculto"
    );


    resumoCalculado.classList.add(
        "oculto"
    );

}
