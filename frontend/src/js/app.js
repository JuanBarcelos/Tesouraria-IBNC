let teste = true;
const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        // fechar o modal
        // remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    },
};

const Storage = {
    get() {
        return (
            JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
        );
    },

    set(transactions) {
        localStorage.setItem(
            'dev.finances:transactions',
            JSON.stringify(transactions)
        );
    },
};

const title = [
    'CURSO SEMINÁRIO TEOLÓGICO',
    'RENDIMENTOS APLICAÇÃO AUTOMÁTICA',
    'MINISTÉRIO DE JOVENS',
    'CARTEIRNHA DE MEMBRO',
    'CONFRATERNIZAÇÃO FINAL DE ANO',
    'CAMPANHA POLTRONAS',
    'MINISTÉRIO DE RECEPÇÃO',
    'MINISTÉRIO DE INTERCESSÃO',
    'MINISTÉRIO DE TEATRO',
    'MINISTÉRIO DE MULHERES',
    'AÇÃO SOCIAL',
    'MINISTÉRIO DE LIBRAS',
    'MINISTÉRIO DE CORAL',
    'MINISTÉRIO DE DANÇA',
    'MINISTÉRIO DE ADOLESCENTES',
    'ÁGUA E ESGOTO',
    'ALUGUEL DO IMÓVEL',
    'COMBUSTÍVEL',
    'DESPESAS COM PESSOAL',
    'ELEMENTOS DA CEIA',
    'ENERGIA ELÉTRICA',
    'EVANGELISMOS E MISSÕES',
    'HONORÁRIOS CONTÁBEIS',
    'LANCHES E REFEIÇÕES',
    'MATERIAL DE CONSERVAÇÃO E MANUTENÇÃO',
    'MATERIAL DE EXPEDIENTE',
    'MATERIAL DE LIMPEZA',
    'MATERIAL DE USO E CONSUMO',
    'MINISTÉRIO DE HOMENS',
    'MINISTÉRIO DE MULTIMÍDIA',
    'MINISTÉRIO INFANTIL',
    'OFERTAS DOS PREGADORES',
    'PASSAGENS E HOSPEDAGENS',
    'SEGURO DO IMÓVEL',
    'TARIFA BANCÁRIA',
    'TELEFONE E INTERNET',
];

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },

    entradas() {
        const list = [];
        Transaction.all.map((transaction) => {

            if (transaction.amount > 0) {
                list.push(transaction)
            }
        });
        return list;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },

    saidas() {
        const list = [];
        Transaction.all.map((transaction) => {
            if (transaction.amount < 0) {
                list.push(transaction);
            }
        });
        return list;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    },

    mensal() {
        const caixa = 12000000;
        return caixa - Transaction.total();
    }
};

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.title}</td>
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="src/img/minus.svg" alt="Remover transação">
        </td>
        `;

        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML =
            Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML =
            Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML =
            Utils.formatCurrency(Transaction.total());
        document.getElementById('caixaDisplay').innerHTML =
            Utils.formatCurrency(Transaction.mensal());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    },
};

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, '')) * 100;

        return value;
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';

        value = String(value).replace(/\D/g, '');

        value = Number(value) / 100;

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return signal + value;
    },
};

const Form = {
    title: document.querySelector('select#titulo'),
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            title: Form.title.value,
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },

    validateFields() {
        const { title, description, amount, date } = Form.getValues();

        if (
            title.trim() === '' ||
            description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === ''
        ) {
            throw new Error('Por favor, preencha todos os campos');
        }
    },

    formatValues() {
        let { title, description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            title,
            description,
            amount,
            date,
        };
    },

    clearFields() {
        Form.title.value = '';
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction);
            Form.clearFields();
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    },
};

const Filter = {
    income() {
        DOM.clearTransactions();
        Transaction.entradas().forEach(DOM.addTransaction);
    },
    expense() {
        DOM.clearTransactions();
        Transaction.saidas().forEach(DOM.addTransaction);
    },
    all() {
        App.init();
    }
}

const Export = {
    table2Excel() {
        var table2excel = new Table2Excel();
        table2excel.export(document.querySelectorAll('table#data-table'));
    },
};

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    },
};

App.init();
