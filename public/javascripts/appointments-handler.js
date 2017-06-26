$(function() {
	$("#especialidade").change(function(e) {
		e.preventDefault();
		$('#medico, #data, #hora').find('*').not('.disabledOption').remove();
		var selectedOption = $('#especialidade :selected').val();
		$.ajax({
			type: 'POST',
			url: "/internal/ajax/medicsAvailable",
			data: {
				'speciality': selectedOption
			},
			success: function(data) {
				var arrObjects = JSON.parse(data);
				//If the array is not empty
				if(arrObjects.length > 0) {
					for(var i = 0; i < arrObjects.length; i++) {
						$('#medico').append('<option value="' + arrObjects[i]._id + '">' + arrObjects[i].nome + '</option>');
					}
				} else {
					alert('Nao há médicos cadastrados com esta especializacão.');
				}
			}
		});
	});

	$("#medico").change(function(e) {
		e.preventDefault();
		$('#data, #hora').find('*').not('.disabledOption').remove();
		var selectedOption = $('#medico :selected').val();
		$.ajax({
			type: 'POST',
			url: "/internal/ajax/daysAvailable",
			data: {
				'idMedico': selectedOption
			},
			success: function(data) {
				var arrDays = JSON.parse(data);
				buildAppointmentDays(arrDays.medicOptions.workingDayStart, arrDays.medicOptions.workingDayEnd, 30);
			}
		});
	});

	$("#data").change(function(e) {
		e.preventDefault();
		$('#hora').find('*').not('.disabledOption').remove();
		$.ajax({
			type: 'POST',
			url: "/internal/ajax/hoursAvailable",
			data: {
				'idMedico': $('#medico :selected').val(),
				'date': $('#data :selected').val()
			},
			success: function(data) {
				var dates = JSON.parse(data);
				if(dates.length > 0) {
					for(var i = 0; i < dates.length; i++) {
						var dateAux = new Date(dates[i]);
						$('#hora').append('<option value="' + dateAux.getTime() + '">' + dateAux.getUTCHours() + ':' + ('0' + dateAux.getUTCMinutes()).slice(-2) + '</option>');
					}
				} else {
					alert('Nao há datas disponíveis para este dia.');
				}
			}
		});
	});
	
	$('#sairModal, #newAppointment .modal-header button').click(function() {
		$('#medico, #data, #hora').find('*').not('.disabledOption').remove();
		$('.disabledOption').prop('selected', 'selected');
	});
	
	$('#marcarModal').click(function() {
		var $valid = $('#newAppointment form').valid();
		if(!$valid) {
			$validator.focusInvalid();
			return false;
		} else {
			$.ajax({
				type: 'POST',
				url: "/internal/ajax/setAppointment",
				data: {
					'idMedico': $('#medico :selected').val(),
					'date': $('#hora :selected').val()
				},
				success: function(data) {
					var Medic = JSON.parse(data);
					var date = new Date(Medic.data);
					console.log(date);
					var brazilianDate = ('0' + date.getDate()).slice(-2) + '/' +
						('0' + (date.getMonth() + 1)).slice(-2) + '/' +
						date.getFullYear();
					var time = (date.getUTCHours() + ':' + ('0' + date.getUTCMinutes()).slice(-2));
					console.log(brazilianDate, time);
					$('#appointmentTable').append(
						'<tr>' +
							'<td>' + Medic.nome + '</td>' +
							'<td>' + brazilianDate + '</td>' +
							'<td>' + time +'</td>' +
							'<td>' +
								'<a class="btn btn-danger btn-fab btn-fab-mini btn-round" rel="tooltip" data-original-title="Cancelar consulta" data-placement="right" data-medic="' + Medic.id + '" data-time="' + date.getTime() +'">' +
									'<i class="material-icons">error</i>' +
									'<div class="ripple-container"></div>' +
								'</a>' +
							'</td>' +
						'</tr>'
					);
					//Reactivate the tooltips
					$('[rel="tooltip"]').tooltip();
					$('#sairModal').click();
				}
			});
		}
	});

	var $validator = $('#newAppointment form').validate({
		rules: {
			especialidade: {
				required: true
			},
			medico : {
				required: true
			},
			data : {
				required: true
			},
			hora : {
				required: true
			}
		},
		errorPlacement: function(error, element) {
			$(element).parent('div').addClass('has-error');
		}
	});
});

Date.prototype.addDays = function(days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
};

function buildAppointmentDays(startingDay, endingDay, numDays) {
	var arrWorkingDays = [];
	var date; 
	var ISOdate;
	var currentDay = new Date();
	var nameDays = [
		'Domingo',
		'Segunda-feira',
		'Terça-feira',
		'Quarta-feira',
		'Quinta-feira',
		'Sexta-feira',
		'Sábado'
	];
	// This is the counter to build the next days to the patient
	var nextDays = 1;
	// Test if the medic work on that specific day
	var medicWork;
	//Get the range of days
	for(var aux = startingDay; aux <= endingDay; aux++) {
		arrWorkingDays.push(aux);
	}
	while(nextDays < numDays) {
		medicWork = currentDay.addDays(nextDays).getDay();
		// If the days that's been tested is a day the medic work
		if($.inArray(medicWork, arrWorkingDays) !== -1) {
			// string containing the ISO date (yyyy-mm-dd). Slice(-2) take the last 2 characters
			ISOdate = currentDay.addDays(nextDays).getFullYear() + '-' + 
				('0' + (currentDay.addDays(nextDays).getMonth() + 1)).slice(-2) + '-' + 
				('0' + currentDay.addDays(nextDays).getDate()).slice(-2);
			// string containing brazilian date (dd/mm/yyyy)
			date = ('0' + currentDay.addDays(nextDays).getDate()).slice(-2) + '/' +
				('0' + (currentDay.addDays(nextDays).getMonth() + 1)).slice(-2) + '/' +
				currentDay.addDays(nextDays).getFullYear();
			$('#data').append('<option value="' + ISOdate +'">' + nameDays[medicWork] + ' - ' + date + '</option>');
		}
		nextDays++;
	}
}
