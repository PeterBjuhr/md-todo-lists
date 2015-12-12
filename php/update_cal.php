<?php
//Convert timestamp date to ical formatted date
function dateToCal($date){
    $date = str_replace('-', '', $date);
    return preg_replace('/(\d+)T.*/', '$1', $date);
}

function create_dtstamp(){
    return date('Ymd\THis\Z', time());
}

function create_vevent($date, $summary){
    $ics_text = "BEGIN:VEVENT\r\n";
    $caldate = dateToCal($date);
    $ics_text .= "DTSTART;VALUE=DATE:" . $caldate . "\r\n";
    $ics_text .= "DTEND;VALUE=DATE:" . $caldate . "\r\n";
    $ics_text .= "DTSTAMP:" . create_dtstamp() . "\r\n";
    $ics_text .= "UID:" . uniqid() . "\r\n";
    if(preg_match('/\[[^\]]+\]\((.+)\)/', $summary, $match)){
        $cut_link = preg_replace('/\[([^\]]+)\]\(.+\)/', '$1', $summary);
        $ics_text .= "SUMMARY:" . $cut_link . "\r\n";
        $ics_text .= "URL;VALUE=URI:" . $match[1] . "\r\n";;
    }else{
        $ics_text .= "SUMMARY:" . $summary . "\r\n";
    }
    $ics_text .= "END:VEVENT\r\n";
    return $ics_text;
}

function create_from_tlist($tlist, $parent=''){
    $ics_text = '';
    foreach ($tlist as $td){
        if(isset($td->date)){
            $ics_text .= create_vevent($td->date, $parent . ' ' . $td->name);
        }elseif (isset($td->tlist)){
            $ics_text .= create_from_tlist($td->tlist, $td->name);
        }
    }
    return $ics_text;
}

//Calendar init text
$ics_text = "BEGIN:VCALENDAR\r\n";
$ics_text .= "VERSION:2.0\r\n";
$ics_text .= "PRODID:-//MD ToDo Lists //Google Calendar 70.9054//EN\r\n";
$ics_text .= "CALSCALE:GREGORIAN\r\n";
$ics_text .= "X-WR-CALNAME:MD ToDo list\r\n";

//Fetch data
$json = $_POST['json'];
$tdobj = json_decode($json);
$ics_text .= create_from_tlist($tdobj->tlist);

//Close file
$ics_text .= "END:VCALENDAR";

//Save the file
file_put_contents('../cal/md-todo-cal.ics', $ics_text);
?>
