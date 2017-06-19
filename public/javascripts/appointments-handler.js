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
				var arrDays = JSON.parse(data);
				buildAppointmentDays(arrDays.medicOptions.workingDayStart, arrDays.medicOptions.workingDayEnd, 30);
			}
		});
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
