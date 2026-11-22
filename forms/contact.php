<?php
  /**
  * Requires the "PHP Email Form" library
  * The "PHP Email Form" library is available only in the pro version of the template
  * The library should be uploaded to: vendor/php-email-form/php-email-form.php
  * For more info and help: https://bootstrapmade.com/php-email-form/
  */

  // Replace contact@example.com with your real receiving email address
  $receiving_email_address = 'contact@example.com';

  if( file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php' )) {
    include( $php_email_form );
  } else {
    die( 'Unable to load the "PHP Email Form" Library!');
  }

  /* ---------- Server-side validation (never trust the browser alone) ---------- */
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); die('Method not allowed.'); }

  // spam trap: real visitors leave this hidden field empty
  if (!empty($_POST['website'])) { echo 'OK'; exit; }

  function field($key) {
    $v = isset($_POST[$key]) ? trim(preg_replace('/\s+/u', ' ', (string)$_POST[$key])) : '';
    return strip_tags($v);
  }
  $name     = field('name');
  $email    = field('email');
  $phone    = field('phone_full') !== '' ? field('phone_full') : field('phone');
  $company  = field('company');
  $location = field('location');
  $subject  = field('subject');
  $message  = isset($_POST['message']) ? trim(strip_tags((string)$_POST['message'])) : '';
  $consent  = isset($_POST['consent']) && $_POST['consent'] === 'yes';

  $errors = [];
  $len = function ($s) { return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s); };
  if ($len($name) < 2 || $len($name) > 60 || !preg_match("/^[\p{L} .'-]+$/u", $name)) $errors[] = 'Please enter a valid name.';
  if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $len($email) > 100)              $errors[] = 'Please enter a valid email address.';
  $digits = preg_replace('/\D/', '', $phone);
  if (strlen($digits) < 6 || strlen($digits) > 15)                                  $errors[] = 'Please enter a valid phone number.';
  if ($len($company) > 100)                                                          $errors[] = 'Company name is too long.';
  if ($len($location) > 80)                                                          $errors[] = 'Location is too long.';
  if ($len($subject) < 3 || $len($subject) > 120)                                    $errors[] = 'Please enter a subject (3-120 characters).';
  if ($len($message) < 10 || $len($message) > 1000)                                  $errors[] = 'Please enter a message (10-1000 characters).';
  if (!$consent)                                                                     $errors[] = 'Please agree to be contacted.';
  // block header injection in fields used for email headers
  foreach ([$name, $email, $subject] as $h) { if (preg_match('/[\r\n]/', $h)) { $errors[] = 'Invalid input.'; break; } }

  if ($errors) { echo implode(' ', array_unique($errors)); exit; }

  $contact = new PHP_Email_Form;
  $contact->ajax = true;

  $contact->to = $receiving_email_address;
  $contact->from_name = $name;
  $contact->from_email = $email;
  $contact->subject = $subject;

  // Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
  /*
  $contact->smtp = array(
    'host' => 'example.com',
    'username' => 'example',
    'password' => 'pass',
    'port' => '587'
  );
  */

  $contact->add_message( $name, 'From');
  $contact->add_message( $email, 'Email');
  $contact->add_message( $phone, 'Phone');
  $contact->add_message( $company, 'Company / Organization');
  $contact->add_message( $location, 'City / Location');
  $contact->add_message( $message, 'Message', 10);

  echo $contact->send();
?>
