class Main implements EventListenerObject {

    private devices: Array<Device> = []; // Almacena los dispositivos cargados
    private deviceTypes: Array<DeviceType> = []; // Almacena los tipos de dispositivos
    private deviceId_edit: number = 0; // Id del dispositivo a editar

    constructor() {

        let btnRefresh = this.retrieveElement("btnRefresh");
        btnRefresh.addEventListener('click', this);

        let btnAddDevice = this.retrieveElement("btnAddDevice");
        btnAddDevice.addEventListener('click', this);

        let btnSave = this.retrieveElement("saveDevice");
        btnSave.addEventListener('click', this);

        let btnCancelChanges = this.retrieveElement("cancelDeviceChanges");
        btnCancelChanges.addEventListener('click', this);

        this.getDeviceTypes(true); // Recibe true para que se refresquen también los dispositivos
    }

    handleEvent(object: Event): void {

        // Manejador de eventos

        let elementId = (<HTMLElement>object.target).id;
        let elementName = (<HTMLInputElement>object.target).name;

        if (elementId === 'btnRefresh') {

            // Refrescar

            this.refreshDevices();

        } else if (elementId === 'saveDevice') {

            // Guardar de dispositivo (nuevo o edición)

            this.saveDevice();

        } else if (elementId === 'cancelDeviceChanges') {
            
            // Cancelar cambios en dispositivo

            this.hideDeviceEditPanel();

        } else if (elementId === 'btnAddDevice') {

            // Agregar nuevo dispositivo (habilita panel para ingreso de datos)

            this.showDeviceEditPanel(-1);

        } else if (elementName === "edit-device-state") {

            // Cambiar estado del dispositivo (con slider)

            let deviceElem = <HTMLInputElement>object.target;
            let deviceId = deviceElem.getAttribute("device-id-bd");
            let deviceValue = deviceElem.value;

            this.updateDeviceState(parseInt(deviceId!), parseFloat(deviceValue));

        } else if (elementName === 'edit-device') {

            // Habilita panel para edición de dispositivo

            let deviceElem = <HTMLInputElement>object.target;
            let deviceId = deviceElem.getAttribute('device-id-bd');

            this.showDeviceEditPanel(parseInt(deviceId));

        } else if (elementName === 'delete-device') {

            // Elimina dispositivo

            let deviceElem = <HTMLInputElement>object.target;
            let deviceId = deviceElem.getAttribute('device-id-bd');

			if (confirm('¿Confirma eliminar el dispositivo?')) {
				this.deleteDevice(parseInt(deviceId));
			}

        }
		
    }

    private refreshDevices(): void {
        /**
         *  Refresca los dispositivos en pantalla con los datos
         *  obtenidos desde la base de datos
         */

        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {

            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                let ul = this.retrieveElement("list");
                let devicesList: string = '';

                this.devices = JSON.parse(xmlHttp.responseText); // Guardamos los dispositivos

                for (let item of this.devices) {
                    let deviceType = this.getDeviceTypeById(item.typeId)
                    devicesList += `<div class="col s12 m6 l3 xl3">
                                    <div class="card blue darken-2 white-text">
                                    <div class="card-content">
                                        <span class="card-title">
                                            <i class="material-icons left" title="${deviceType.name}">${deviceType.icon_name}</i> 
                                            ${item.name}
                                        </span>
                                        <p>${item.description}</p>
                                        <p>
                                            <input device-id-bd="${item.id}" 
                                                   name="edit-device-state"  
                                                   type="range" 
                                                   min="0" 
                                                   max="1" 
                                                   step="0.1" 
                                                   value="${item.state}">
                                        </p>
                                    </div>
                                    <div class="card-action">
                                        <a href="#" name='edit-device' class="white-text" device-id-bd="${item.id}">EDITAR</a>
                                        <a href="#" name='delete-device' class="white-text" device-id-bd="${item.id}"">ELIMINAR</a>
                                    </div>
                                    </div></div>`;
                }

                ul.innerHTML = devicesList;

                // Se agregan eventos para los botones de editar
                let editButtons = document.getElementsByName('edit-device');
                editButtons.forEach(button => {
                    button.addEventListener('click', this);
                });

                // Se agregan eventos para los editores de estado
                let stateEditButtons = document.getElementsByName('edit-device-state');
                stateEditButtons.forEach(button => {
                    button.addEventListener('change', this); // Escucha cambios en el slider
                });

                // Se agregan eventos para los botones de eliminar
                let deleteButtons = document.getElementsByName('delete-device');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', this);
                });

            } else if (xmlHttp.readyState == 4) {
                alert("Error al obtener dispositivos");
            }
        };

        xmlHttp.open("GET", "http://localhost:8000/devices", true);
        xmlHttp.send();
    }

    private updateDeviceState(deviceId: number, newState: number): void {
        /**
         *  Actualiza el estado de un dispositivo
         * 
         *  Args:
         *      deviceId: Id de dispositivo
         *      newState: Valor del nuevo estado (entre 0 y 1)
         * 
         */

        if (isNaN(deviceId) || isNaN(newState) || newState < 0 || newState > 1) {
            alert('Valor no válido');
            return;
        }

        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                // Refresca los dispositivos después de la actualización
                this.refreshDevices();
            } else if (xmlHttp.readyState == 4) {
                alert(`Error al actualizar el estado del dispositivo ${deviceId}`);
            }
        };

        // Se utiliza el método PATCH que es adecuado para actualización parcial de recursos
        xmlHttp.open("PATCH", `http://localhost:8000/device/${deviceId}/state`, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send(JSON.stringify({ state: newState }));
    }

    private showDeviceEditPanel(deviceId: number): void {
        /**
         *  Muestra el panel de edición de dispositivo (para alta y modificación)
         * 
         *  Args:
         *      deviceId: Id de dispositivo
         * 
         */

        this.deviceId_edit = deviceId;

        if (this.deviceId_edit > 0) {
            
            let device = this.getDeviceById(this.deviceId_edit);            

            this.refreshDeviceTypesCombo(device.typeId);

            this.retrieveElement("deviceEditorTitle").innerText = "Editar dispositivo";
            this.retrieveElement("editName").value = device.name;
            this.retrieveElement("editDescription").value = device.description;
            this.retrieveElement("editNameLabel").classList.add("active");
            this.retrieveElement("editDescriptionLabel").classList.add("active");

        } else {
            this.refreshDeviceTypesCombo(0);
            this.retrieveElement("deviceEditorTitle").innerText = "Agregar dispositivo";
            this.retrieveElement("editName").value = "";
            this.retrieveElement("editDescription").value = "";
            this.retrieveElement("editNameLabel").classList.remove("active");
            this.retrieveElement("editDescriptionLabel").classList.remove("active");
        }

        let panel = document.getElementById("editPanel");
        if (panel) panel.style.display = "block";

        this.hideActionPanel();
    }

    private hideDeviceEditPanel(): void {
        /**
         *  Oculta el panel de edición de dispositivo
         */
        
        this.retrieveElement("editName").value = "";
        this.retrieveElement("editDescription").value = "";
        this.retrieveElement("editTypeId").value = "0";

        let panel = document.getElementById("editPanel");
        if (panel) panel.style.display = "none";

        this.showActionPanel();
    }

    private deleteDevice(deviceId: number): void {
        /**
         *  Elimina un dispositivo
         * 
         *  Args:
         *      deviceId: Id de dispositivo
         * 
         */

        if (isNaN(deviceId)) {
            alert('Dispositivo no válido');
            return;
        }

        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                console.log(`Dispositivo ${deviceId} eliminado exitosamente.`);
                this.refreshDevices(); // Refresca los dispositivos después de eliminar
            } else if (xmlHttp.readyState == 4) {
                alert(`Error al eliminar el dispositivo ${deviceId}`);
            }
        };
    
        xmlHttp.open("DELETE", `http://localhost:8000/device/${deviceId}`, true);
        xmlHttp.send();
    }    

    private hideActionPanel(): void {
        /**
         *  Oculta el panel de acciones
         */

        this.retrieveElement("actionPanel").style.display = "none";
    }

    private showActionPanel(): void {
        /**
         * Muestra el panel de acciones
         */

        this.retrieveElement("actionPanel").style.display = "block";
    }

    private saveDevice(): void {
        /**
         *  Guarda el dispositivo que se está creando o editando
         */

        let deviceName = this.retrieveElement("editName").value;
        let deviceDescription = this.retrieveElement("editDescription").value;
        let deviceTypeId = this.retrieveElement("editTypeId").value;
    
        if (!deviceName || !deviceDescription || deviceTypeId === '0') {
            alert('No se han ingresado todos los datos');
            return;
        }
    
        let isEditing = this.deviceId_edit > 0;

        if (!confirm(`¿Confirma ${ isEditing ? 'editar' : 'agregar'} el dispositivo?`)) {
            return;
        }

        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status.toString().startsWith('2')) {
                this.hideDeviceEditPanel();
                this.refreshDevices(); // Refresca los dispositivos después de guardar
            } else if (xmlHttp.readyState == 4) {
                alert(`Error al guardar el dispositivo ${deviceName}`);
            }
        };        

        let method = isEditing ? "PUT" : "POST";
        let url = isEditing ? `http://localhost:8000/device/${this.deviceId_edit}` : "http://localhost:8000/device";
    
        xmlHttp.open(method, url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
    
        let deviceData = {
            name: deviceName,
            description: deviceDescription,
            typeId: parseInt(deviceTypeId)
        };
    
        xmlHttp.send(JSON.stringify(deviceData));
    }
    
    private getDeviceTypes(refreshDevices: boolean): void {
        /**
         *  Obtiene los tipos de dispositivos disponibles
         * 
         *  Args:
         *      refreshDevices: Indica si además se deben refrescar los dispositivos.
         *                      Es útil para la primera carga de la página para evitar
         *                      que se carguen los dispositivos sin aún haber cargado los tipos
         */

        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                // Se guardan los tipos de dispositivos
                this.deviceTypes = JSON.parse(xmlHttp.responseText);

                if (refreshDevices) {
                    this.refreshDevices();
                }

            } else if (xmlHttp.readyState == 4) {
                alert("ERROR en la consulta");
            }
        };

        xmlHttp.open("GET", "http://localhost:8000/deviceTypes", true);
        xmlHttp.send();
        
    }

    private getDeviceTypeById(id: number): DeviceType | undefined {
        /**
         *  Devuelve el tipo de dispositivo a partir de un id
         * 
         *  Args:
         *      id: Id de tipo de dispositivo
         * 
         *  Out:
         *      DeviceType | undefined: Clase con el tipo de dispositivo o undefined si no existe
         * 
         */
        return this.deviceTypes.find(deviceType => deviceType.id == id);
    }

    private getDeviceById(id: number): Device | undefined {
        /**
         *  Devuelve el dispositivo a partir de un id
         * 
         *  Args:
         *      id: Id de dispositivo
         * 
         *  Out:
         *      Device | undefined: Clase del dispositivo o undefined si no existe
         * 
         */
        return this.devices.find(device => device.id == id);
    }

    private refreshDeviceTypesCombo(deviceTypeId: number): void {
        /**
         *  Refresca el combo de tipos de dispositivos.
         * 
         *  Args:
         *      deviceTypeId (opcional): Id de tipo de dispositivo. Si lo recibe queda marcado por defecto
         * 
         */

        let comboOptionsInnerHTML = '<option value="0" disabled selected>Seleccionar una opción</option>';
        for (let deviceType of this.deviceTypes) {
            comboOptionsInnerHTML += `<option value="${deviceType.id}" ${deviceTypeId === deviceType.id ? "selected":""}>${deviceType.name}</option>`
        }

        let combo = this.retrieveElement("editTypeId");
        combo.innerHTML = comboOptionsInnerHTML;

        M.FormSelect.init(combo);

    }

    private retrieveElement(id: string): HTMLInputElement {
        /**
         *  Devuelve un elemento del DOM a partir de un id
         * 
         *  Args:
         *      id: Id del elemento en el DOM
         * 
         *  Out:
         *      HTMLInputElement: Elemento input del DOM
         * 
         */

        return <HTMLInputElement>document.getElementById(id);
    }
}

// Se carga la clase en el evento load
window.addEventListener('load', () => {
    let main: Main = new Main();
});


// Las siguientes líneas se agregan para funcionamiento de elementos de Materialize

// Se agrega esta declaración para que TS no devuelva error.
declare const M: any;

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});
