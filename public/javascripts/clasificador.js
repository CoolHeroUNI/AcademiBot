function PopulateCursos(Key) {
    const selectFacultad = document.getElementById(Key + '-Facultad');
    const selectCurso = document.getElementById(Key + '-Curso');
    selectCurso.options.length = 0;
    const i = Facultades.indexOf(selectFacultad.value);
    const cursos = Cursos[i];
    for (let j = 0; j < cursos.length; j++) {
        const curso = cursos[j];
        const Codigo = curso['Codigo'];
        const Nombre = curso['Nombre'];
        selectCurso.options[i] = new Option(Nombre, Codigo);
    }
}
function PostRequest(Key) {

}
function DeleteEntry(Key) {

}
const Folders = Keys.map(function (key) {
    const lista = key.split('/');
    return lista[lista.length - 2];
}).filter(function (v, i, self) {
    return self.indexOf(v) === i;
});
const OpcionesCarpetas = [1,2,3,4,5].map(num => num+'pc');
OpcionesCarpetas.push('examen-parcial');
OpcionesCarpetas.push('examen-final');
OpcionesCarpetas.push('sustitutorio');
OpcionesCarpetas.push('entrada');
OpcionesCarpetas.push('material-adicional');
const firstRow = document.createElement('tr');
const columns = [
    document.createElement('th'),
    document.createElement('th'),
    document.createElement('th'),
    document.createElement('th'),
    document.createElement('th'),
    document.createElement('th'),
    document.createElement('th')
];
columns[0].innerText = 'Material';
columns[1].innerText = 'Facultad';
columns[2].innerText = 'Curso';
columns[3].innerText = 'Carpeta';
columns[4].innerText = 'Archivo-Pagina-Extension';
columns[5].innerHTML = 'Submit';
columns[6].innerHTML = 'Delete';
for (let column of columns) firstRow.appendChild(column);

for (let folder of Folders) {
    const button = document.createElement('button');
    button.classList.add('collapsible');
    button.textContent = folder;
    document.body.append(button);
    const MatchingKeys = Keys.filter(function (ruta) {
        return ruta.indexOf(folder) >= 0;
    });
    const content = document.createElement('div');
    content.classList.add('content');
    const table = document.createElement('table');
    table.appendChild(firstRow);
    for (let key of MatchingKeys) {
        const nthRow = document.createElement('tr');
        const Form = document.createElement('form');
        Form.action = '/admin/clasificador';
        Form.method = 'POST';
        key = '' + key;
        const fileName = key.split('/').pop();
        const ext = '.' + fileName.split('.').pop();
        const name = fileName.substr(0, fileName.lastIndexOf('.'));
        const Columns = [
            document.createElement('td'),
            document.createElement('td'),
            document.createElement('td'),
            document.createElement('td'),
            document.createElement('td'),
            document.createElement('td'),
            document.createElement('td')
        ];
        const anchor = document.createElement('a');
        anchor.innerText = name;
        anchor.setAttribute('href', '/admin/API?key='+key);
        anchor.setAttribute('download', fileName);
        Columns[0].innerHTML = anchor.outerHTML;
        const selectFacultad = document.createElement('select');
        selectFacultad.id = key + '-Facultad';
        selectFacultad.name = 'Facultad';
        selectFacultad.setAttribute('onchange', `PopulateCursos('${key}')`);
        for (let i = 0; i < Facultades.length; i++) {
            const facultad = '' + Facultades[i];
            selectFacultad.options[i] = new Option(facultad, facultad);
        }
        Columns[1].innerHTML = selectFacultad.outerHTML;
        const selectCursos = document.createElement('select');
        selectCursos.id = key + '-Curso';
        selectCursos.name = 'Curso';
        Columns[2].innerHTML = selectCursos.outerHTML;
        const selectCarpeta = document.createElement('select');
        selectCarpeta.id = key + '-Carpeta';
        selectCarpeta.name = 'Carpeta';
        for (let i = 0; i < OpcionesCarpetas.length; i++) {
            const carpeta = OpcionesCarpetas[i];
            selectCarpeta.options[i] = new Option(carpeta, carpeta);
        }
        Columns[3].innerHTML = selectCarpeta.outerHTML;
        const textNombre = document.createElement('input');
        textNombre.id = key + '-Nombre';
        textNombre.type = 'text';
        textNombre.placeholder = name;
        textNombre.name = 'Archivo';
        const page = document.createElement('input');
        page.id = key + '-Number';
        page.type = 'number';
        page.name = 'Pagina';
        page.value = '1';
        const extension = document.createElement('input');
        extension.id = key + '-Extension';
        extension.type = 'text';
        extension.name = 'Extension';
        extension.value = ext;
        extension.readOnly = true;
        Columns[4].appendChild(textNombre);
        Columns[4].appendChild(page);
        Columns[4].appendChild(extension);
        const submit = document.createElement('button');
        submit.id = key + '-Submit';
        submit.textContent = 'Enviar';
        submit.addEventListener('click', PostRequest(key));
        Columns[5].innerHTML = submit.outerHTML;
        const del = document.createElement('button');
        del.id = key + '-Delete';
        del.textContent = 'Eliminar';
        del.addEventListener('click', DeleteEntry(key));
        Columns[6].innerHTML = del.outerHTML;
        for (let column of Columns) Form.appendChild(column);
        nthRow.innerHTML = Form.outerHTML;
        table.appendChild(nthRow);
    }
    content.innerHTML = table.outerHTML;
    document.body.appendChild(content);
}
for (let Key of Keys) {
    PopulateCursos(Key);
}