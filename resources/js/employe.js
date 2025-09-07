(function(){
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const calendar = document.getElementById('calendar');
  const saveBtn = document.getElementById('saveBtn');
  const csrf = document.getElementById('csrf-token');

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedValue = '1';

  // Fetch CSRF token
  fetch('/csrf-token',{credentials:'same-origin'})
    .then(r=>r.json()).then(d=>{ csrf.value = d.token; });

  // Build selectors
  months.forEach((m,i)=>{
    const opt = document.createElement('option');
    opt.value = i+1; opt.textContent = m; if(i===currentMonth) opt.selected=true; monthSelect.appendChild(opt);
  });
  for(let y=currentYear-1; y<=currentYear+1; y++){
    const opt=document.createElement('option'); opt.value=y; opt.textContent=y; if(y===currentYear) opt.selected=true; yearSelect.appendChild(opt);
  }

  document.querySelectorAll('.chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      selectedValue = chip.dataset.value;
    });
  });
  document.querySelector('.chip[data-value="1"]').classList.add('active');

  function buildCalendar(year, month){
    const first = new Date(year, month-1, 1);
    const last = new Date(year, month, 0);
    const days = last.getDate();
    let html = '<table class="cal"><thead><tr><th>Projet</th>';
    for(let d=1; d<=days; d++){ html += '<th>'+d+'</th>'; }
    html += '</tr></thead><tbody>';

    const projects = ['Projet 1','Projet 2','Projet 3','Projet 4','Projet 5'];
    projects.forEach((p,pi)=>{
      html += '<tr><th>'+p+'</th>';
      for(let d=1; d<=days; d++){
        const date = new Date(year, month-1, d);
        const wd = date.getDay(); // 0 Sun, 6 Sat
        const weekend = (wd===0 || wd===6);
        const cls = weekend ? 'day weekend slight' : 'day';
        html += '<td class="'+cls+'" data-date="'+formatDate(year,month,d)+'" data-project="'+pi+'">'
              + '<input type="text" value="" placeholder="0/0.5/1" />'
              + '</td>';
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    calendar.innerHTML = html;

    // Clicking a day fills with selectedValue
    calendar.querySelectorAll('.day').forEach(cell=>{
      cell.addEventListener('click',()=>{
        const input = cell.querySelector('input');
        input.value = selectedValue;
      });
    });
  }

  function formatDate(y,m,d){
    const mm = String(m).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    return `${y}-${mm}-${dd}`;
  }

  function collectEntries(){
    const entries = {};
    calendar.querySelectorAll('.day').forEach(cell=>{
      const v = (cell.querySelector('input').value||'').trim();
      if(['0','0.5','1'].includes(v)){
        entries[cell.dataset.date] = v;
      }
    });
    return entries;
  }

  prevBtn.addEventListener('click',()=>{
    if(currentMonth===0){ currentMonth=11; currentYear--; } else { currentMonth--; }
    monthSelect.value = currentMonth+1; yearSelect.value=currentYear; buildCalendar(currentYear,currentMonth+1);
  });
  nextBtn.addEventListener('click',()=>{
    if(currentMonth===11){ currentMonth=0; currentYear++; } else { currentMonth++; }
    monthSelect.value = currentMonth+1; yearSelect.value=currentYear; buildCalendar(currentYear,currentMonth+1);
  });
  monthSelect.addEventListener('change',()=>{ currentMonth = parseInt(monthSelect.value,10)-1; buildCalendar(currentYear,currentMonth+1); });
  yearSelect.addEventListener('change',()=>{ currentYear = parseInt(yearSelect.value,10); buildCalendar(currentYear,currentMonth+1); });

  saveBtn.addEventListener('click',()=>{
    const payload = { year: currentYear, month: currentMonth+1, entries: collectEntries() };
    fetch('/employe/cra/save',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-CSRF-TOKEN':csrf.value},
      credentials:'same-origin',
      body: JSON.stringify(payload)
    }).then(r=>r.json()).then(d=>{
      alert(d.message || 'CRA sauvegardé');
    }).catch(()=>{ alert('Erreur lors de la sauvegarde'); });
  });

  buildCalendar(currentYear,currentMonth+1);
})();


