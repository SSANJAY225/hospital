-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 26, 2026 at 03:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `visualpl_zfitbot`
--

-- --------------------------------------------------------

--
-- Table structure for table `advance`
--

CREATE TABLE `advance` (
  `advance` int(100) DEFAULT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Phone_Number` varchar(100) DEFAULT NULL,
  `Visit` int(100) DEFAULT NULL,
  `date_paid` date DEFAULT NULL,
  `method` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `advance`
--

INSERT INTO `advance` (`advance`, `Name`, `Phone_Number`, `Visit`, `date_paid`, `method`) VALUES
(34, 'Sanjay S', '9952535674', 1, '2026-04-26', 'cash'),
(1916, 'Sanjay S', '9952535674', 1, '2026-04-26', 'cash'),
(2034, 'sam', '1234567890', 1, '2026-04-26', 'cash');

-- --------------------------------------------------------

--
-- Table structure for table `advicegiven`
--

CREATE TABLE `advicegiven` (
  `id` int(11) NOT NULL,
  `advicegiven_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `advicegiven`
--

INSERT INTO `advicegiven` (`id`, `advicegiven_text`) VALUES
(2, 'adv1'),
(3, 'adv2');

-- --------------------------------------------------------

--
-- Table structure for table `allergy_history`
--

CREATE TABLE `allergy_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_number` varchar(15) NOT NULL,
  `Visted` int(100) NOT NULL,
  `Allergy_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `allergy_history`
--

INSERT INTO `allergy_history` (`Name`, `Phone_number`, `Visted`, `Allergy_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `anyotherhistory`
--

CREATE TABLE `anyotherhistory` (
  `Name` varchar(50) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visted` int(100) NOT NULL,
  `Other_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `anyotherhistory`
--

INSERT INTO `anyotherhistory` (`Name`, `Phone_Number`, `Visted`, `Other_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `billing_details`
--

CREATE TABLE `billing_details` (
  `id` int(11) NOT NULL,
  `billing_id` varchar(500) NOT NULL,
  `service_name` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `discount` varchar(255) DEFAULT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `advance` varchar(100) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `billing_details`
--

INSERT INTO `billing_details` (`id`, `billing_id`, `service_name`, `price`, `created_at`, `discount`, `detail`, `advance`) VALUES
(141, 'UNK-SA-001-20260425-619', 'adsf', 50.00, '2026-04-26 03:19:21', '0', '', NULL),
(154, 'UNK-SA-001-20260426-497', 'asdf', 34.00, '2026-04-26 03:52:12', '0', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `billing_headers`
--

CREATE TABLE `billing_headers` (
  `id` varchar(500) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `visit_number` varchar(50) NOT NULL,
  `nurse_name` varchar(100) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `billing_date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(255) DEFAULT NULL,
  `membership` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `discount` int(11) DEFAULT NULL,
  `membership_offer` varchar(255) DEFAULT NULL,
  `membership_price` varchar(255) DEFAULT NULL,
  `membership_type` varchar(255) DEFAULT NULL,
  `review_date` varchar(255) DEFAULT NULL,
  `doctor_name` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `billing_headers`
--

INSERT INTO `billing_headers` (`id`, `user_id`, `user_name`, `phone_number`, `visit_number`, `nurse_name`, `total_price`, `billing_date`, `created_at`, `payment_method`, `membership`, `reference`, `discount`, `membership_offer`, `membership_price`, `membership_type`, `review_date`, `doctor_name`) VALUES
('UNK-SA-001-20260425-619', 'A00F18361', 'Sanjay S', '9952535674', '1', 'nur1', 1950.00, '2026-04-26 03:19:21', '2026-04-25 07:09:19', 'cash', NULL, '4sdf', NULL, '100.00', '2000.00', 'gold', '2026-04-26', 'nur2'),
('UNK-SA-001-20260426-497', 'A00F11392', 'sam', '1234567890', '1', 'nur1', 2034.00, '2026-04-26 03:52:12', '2026-04-26 03:24:37', 'cash', NULL, 'af', NULL, '0.00', '2000.00', 'gold', '2026-04-26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `birth_history`
--

CREATE TABLE `birth_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visted` int(100) NOT NULL,
  `Birth_History` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `birth_history`
--

INSERT INTO `birth_history` (`Name`, `Phone_Number`, `Visted`, `Birth_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `blood_investigation`
--

CREATE TABLE `blood_investigation` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(50) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `Blood_Investigation` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blood_investigation`
--

INSERT INTO `blood_investigation` (`Name`, `Phone_Number`, `Visted`, `Blood_Investigation`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `complaint_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `complaint_text`) VALUES
(2, 'c1'),
(3, 'c2');

-- --------------------------------------------------------

--
-- Table structure for table `dental_history`
--

CREATE TABLE `dental_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_number` varchar(15) NOT NULL,
  `Visted` int(100) NOT NULL,
  `Dental_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dental_history`
--

INSERT INTO `dental_history` (`Name`, `Phone_number`, `Visted`, `Dental_History`) VALUES
('Sanjay S', '9952535674', 1, 'adf');

-- --------------------------------------------------------

--
-- Table structure for table `dental_records`
--

CREATE TABLE `dental_records` (
  `Name` varchar(255) DEFAULT NULL,
  `Phone_number` varchar(20) DEFAULT NULL,
  `Visit` int(10) DEFAULT NULL,
  `t11` text DEFAULT NULL,
  `t12` text DEFAULT NULL,
  `t13` text DEFAULT NULL,
  `t14` text DEFAULT NULL,
  `t15` text DEFAULT NULL,
  `t16` text DEFAULT NULL,
  `t17` text DEFAULT NULL,
  `t18` text DEFAULT NULL,
  `t21` text DEFAULT NULL,
  `t22` text DEFAULT NULL,
  `t23` text DEFAULT NULL,
  `t24` text DEFAULT NULL,
  `t25` text DEFAULT NULL,
  `t26` text DEFAULT NULL,
  `t27` text DEFAULT NULL,
  `t28` text DEFAULT NULL,
  `t31` text DEFAULT NULL,
  `t32` text DEFAULT NULL,
  `t33` text DEFAULT NULL,
  `t34` text DEFAULT NULL,
  `t35` text DEFAULT NULL,
  `t36` text DEFAULT NULL,
  `t37` text DEFAULT NULL,
  `t38` text DEFAULT NULL,
  `t41` text DEFAULT NULL,
  `t42` text DEFAULT NULL,
  `t43` text DEFAULT NULL,
  `t44` text DEFAULT NULL,
  `t45` text DEFAULT NULL,
  `t46` text DEFAULT NULL,
  `t47` text DEFAULT NULL,
  `t48` text DEFAULT NULL,
  `t55` text DEFAULT NULL,
  `t56` text DEFAULT NULL,
  `t57` text DEFAULT NULL,
  `t58` text DEFAULT NULL,
  `t59` text DEFAULT NULL,
  `t60` text DEFAULT NULL,
  `t61` text DEFAULT NULL,
  `t62` text DEFAULT NULL,
  `t63` text DEFAULT NULL,
  `t64` text DEFAULT NULL,
  `t65` text DEFAULT NULL,
  `t85` text DEFAULT NULL,
  `t84` text DEFAULT NULL,
  `t83` text DEFAULT NULL,
  `t82` text DEFAULT NULL,
  `t81` text DEFAULT NULL,
  `t70` text DEFAULT NULL,
  `t71` text DEFAULT NULL,
  `t72` text DEFAULT NULL,
  `t73` text DEFAULT NULL,
  `t74` text DEFAULT NULL,
  `t75` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dental_records`
--

INSERT INTO `dental_records` (`Name`, `Phone_number`, `Visit`, `t11`, `t12`, `t13`, `t14`, `t15`, `t16`, `t17`, `t18`, `t21`, `t22`, `t23`, `t24`, `t25`, `t26`, `t27`, `t28`, `t31`, `t32`, `t33`, `t34`, `t35`, `t36`, `t37`, `t38`, `t41`, `t42`, `t43`, `t44`, `t45`, `t46`, `t47`, `t48`, `t55`, `t56`, `t57`, `t58`, `t59`, `t60`, `t61`, `t62`, `t63`, `t64`, `t65`, `t85`, `t84`, `t83`, `t82`, `t81`, `t70`, `t71`, `t72`, `t73`, `t74`, `t75`) VALUES
('Sanjay S', '9952535674', 1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '2', '', '', '', '', '', '', '', '', '', '', '2', '', '', '', '', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `dental_values`
--

CREATE TABLE `dental_values` (
  `id` int(11) NOT NULL,
  `dental_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dental_values`
--

INSERT INTO `dental_values` (`id`, `dental_text`) VALUES
(41, '1'),
(42, '2'),
(43, '3');

-- --------------------------------------------------------

--
-- Table structure for table `doctors_name`
--

CREATE TABLE `doctors_name` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `number` varchar(15) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `doctors_name`
--

INSERT INTO `doctors_name` (`id`, `name`, `location`, `number`) VALUES
(23, 'nur2', 'karur', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dosage`
--

CREATE TABLE `dosage` (
  `id` int(11) NOT NULL,
  `dosage_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dosage`
--

INSERT INTO `dosage` (`id`, `dosage_text`) VALUES
(3, 'dos1'),
(4, 'dos2');

-- --------------------------------------------------------

--
-- Table structure for table `drugs`
--

CREATE TABLE `drugs` (
  `id` int(11) NOT NULL,
  `drugs_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drugs`
--

INSERT INTO `drugs` (`id`, `drugs_text`) VALUES
(2, 'dr1'),
(3, 'dr2');

-- --------------------------------------------------------

--
-- Table structure for table `duration`
--

CREATE TABLE `duration` (
  `id` int(11) NOT NULL,
  `duration_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `duration`
--

INSERT INTO `duration` (`id`, `duration_text`) VALUES
(2, 'dur1'),
(3, 'dur2');

-- --------------------------------------------------------

--
-- Table structure for table `famil_history`
--

CREATE TABLE `famil_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) NOT NULL,
  `Family_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `famil_history`
--

INSERT INTO `famil_history` (`Name`, `Phone_Number`, `Visted`, `Family_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `filemanagement`
--

CREATE TABLE `filemanagement` (
  `full_name` varchar(255) NOT NULL,
  `visted` int(11) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `filebase64` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_patient`
--

CREATE TABLE `general_patient` (
  `Name` varchar(25) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(10) DEFAULT NULL,
  `Major_Complaints` text DEFAULT NULL,
  `FollowUpDate` date DEFAULT NULL,
  `Advice_Given` text DEFAULT NULL,
  `Dignosis` text DEFAULT NULL,
  `belongedlocation` varchar(100) DEFAULT NULL,
  `Oral_Hygiene` text DEFAULT NULL,
  `FinalDiagnosis` text DEFAULT NULL,
  `followUpTime` time DEFAULT NULL,
  `review_call` tinyint(1) DEFAULT 0,
  `consultant_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `general_patient`
--

INSERT INTO `general_patient` (`Name`, `Phone_Number`, `Visted`, `Major_Complaints`, `FollowUpDate`, `Advice_Given`, `Dignosis`, `belongedlocation`, `Oral_Hygiene`, `FinalDiagnosis`, `followUpTime`, `review_call`, `consultant_name`) VALUES
('Sanjay S', '9952535674', 1, 'asdf', '2026-04-25', 'sdfg', 'asdf', 'karur', 'adfs', 'asdf', '12:38:00', 0, 'sdfg'),
('sam', '1234567890', 1, '', '2025-10-26', '', '', 'karur', '', NULL, '00:00:00', 0, 'Previous Value Missing');

-- --------------------------------------------------------

--
-- Table structure for table `habit_history`
--

CREATE TABLE `habit_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_number` text NOT NULL,
  `Visted` int(100) NOT NULL,
  `Habit_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `habit_history`
--

INSERT INTO `habit_history` (`Name`, `Phone_number`, `Visted`, `Habit_History`) VALUES
('Sanjay S', '9952535674', 1, 'adf');

-- --------------------------------------------------------

--
-- Table structure for table `histopathological_investigation`
--

CREATE TABLE `histopathological_investigation` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(50) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `Histopathological_Investigation` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `histopathological_investigation`
--

INSERT INTO `histopathological_investigation` (`Name`, `Phone_Number`, `Visted`, `Histopathological_Investigation`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `local_factor`
--

CREATE TABLE `local_factor` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `Local_Factor` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `local_factor`
--

INSERT INTO `local_factor` (`Name`, `Phone_Number`, `Visted`, `Local_Factor`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lymph_nodes`
--

CREATE TABLE `lymph_nodes` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `LymphNodes` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lymph_nodes`
--

INSERT INTO `lymph_nodes` (`Name`, `Phone_Number`, `Visted`, `LymphNodes`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `malocclusion`
--

CREATE TABLE `malocclusion` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `malocclusion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `malocclusion`
--

INSERT INTO `malocclusion` (`Name`, `Phone_Number`, `Visted`, `malocclusion`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `manage_membership`
--

CREATE TABLE `manage_membership` (
  `Name` varchar(100) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `membership_type` varchar(50) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_thru` date DEFAULT NULL,
  `visit` int(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manage_membership`
--

INSERT INTO `manage_membership` (`Name`, `Phone_Number`, `membership_type`, `valid_from`, `valid_thru`, `visit`) VALUES
('sam', '1234567890', 'gol', '2026-04-26', '2026-04-25', 1);

-- --------------------------------------------------------

--
-- Table structure for table `medical_history`
--

CREATE TABLE `medical_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_number` varchar(15) NOT NULL,
  `Visted` int(20) NOT NULL,
  `Medical_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_history`
--

INSERT INTO `medical_history` (`Name`, `Phone_number`, `Visted`, `Medical_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `medication_history`
--

CREATE TABLE `medication_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_number` varchar(15) NOT NULL,
  `Visted` int(100) NOT NULL,
  `Medication_History` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medication_history`
--

INSERT INTO `medication_history` (`Name`, `Phone_number`, `Visted`, `Medication_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

CREATE TABLE `memberships` (
  `id` int(11) NOT NULL,
  `membership_type` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`id`, `membership_type`, `price`) VALUES
(2, 'gold', 2000.00),
(3, 'silver', 1500.00);

-- --------------------------------------------------------

--
-- Table structure for table `moa`
--

CREATE TABLE `moa` (
  `id` int(11) NOT NULL,
  `moa` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `moa`
--

INSERT INTO `moa` (`id`, `moa`) VALUES
(3, 'moa1'),
(4, 'moa2');

-- --------------------------------------------------------

--
-- Table structure for table `nurses_name`
--

CREATE TABLE `nurses_name` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `number` varchar(15) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `nurses_name`
--

INSERT INTO `nurses_name` (`id`, `name`, `location`, `number`) VALUES
(29, 'nur1', 'karur', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `onexam`
--

CREATE TABLE `onexam` (
  `id` int(11) NOT NULL,
  `onexam_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `onexam`
--

INSERT INTO `onexam` (`id`, `onexam_text`) VALUES
(13, 'on1'),
(14, 'on2');

-- --------------------------------------------------------

--
-- Table structure for table `on_examination_form`
--

CREATE TABLE `on_examination_form` (
  `Name` varchar(20) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visited` int(100) NOT NULL,
  `onexam_form` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `on_examination_form`
--

INSERT INTO `on_examination_form` (`Name`, `Phone_Number`, `Visited`, `onexam_form`) VALUES
('Sanjay S', '9952535674', 1, 'on2');

-- --------------------------------------------------------

--
-- Table structure for table `other_findings`
--

CREATE TABLE `other_findings` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `OtherFindings` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `other_findings`
--

INSERT INTO `other_findings` (`Name`, `Phone_Number`, `Visted`, `OtherFindings`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `other_investigation`
--

CREATE TABLE `other_investigation` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(50) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `Other_Investigation` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `other_investigation`
--

INSERT INTO `other_investigation` (`Name`, `Phone_Number`, `Visted`, `Other_Investigation`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `particular`
--

CREATE TABLE `particular` (
  `id` int(11) NOT NULL,
  `particular_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `particular`
--

INSERT INTO `particular` (`id`, `particular_text`) VALUES
(3, 'p1'),
(4, 'p2');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` varchar(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `fathers_name` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `services` text DEFAULT NULL,
  `status` varchar(255) DEFAULT 'not completed',
  `visted` int(11) DEFAULT 0,
  `receptionistname` varchar(255) DEFAULT NULL,
  `patient_type` varchar(50) DEFAULT NULL,
  `belongedlocation` varchar(100) DEFAULT NULL,
  `nursename` varchar(100) DEFAULT NULL,
  `doctorname` varchar(100) DEFAULT NULL,
  `membertype` varchar(50) DEFAULT NULL,
  `entrydate` date DEFAULT NULL,
  `queue` int(10) UNSIGNED NOT NULL,
  `entrydatedoctor` date DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `parent_occupation` varchar(100) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `refference` varchar(255) DEFAULT NULL,
  `topupdate` date DEFAULT NULL,
  `reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `full_name`, `fathers_name`, `age`, `gender`, `city`, `phone_number`, `appointment_date`, `appointment_time`, `services`, `status`, `visted`, `receptionistname`, `patient_type`, `belongedlocation`, `nursename`, `doctorname`, `membertype`, `entrydate`, `queue`, `entrydatedoctor`, `room_number`, `occupation`, `parent_name`, `parent_occupation`, `address`, `refference`, `topupdate`, `reason`) VALUES
('A00F11392', 'sam', '', 34, 'Male', '', '1234567890', '2026-04-26', '08:51:00', 'general', 'doctorcompleted', 1, 'res1', 'Outpatient', 'karur', 'nur1', NULL, NULL, '2026-04-26', 139, NULL, NULL, 'asdf', 'asdf', 'asdf', 'asdf', 'asdf', NULL, NULL),
('A00F18361', 'Sanjay S', '', 23, 'Male', '', '9952535674', '2026-04-25', '12:15:00', 'dental', 'doctorcompleted', 1, 'res1', 'Outpatient', 'karur', 'nur1', 'nur2', 'gold', '2025-04-25', 137, NULL, NULL, 'asd', 'asdf', 'asdf', '271,subramaniya puram,mohanur', 'xc', '2025-04-25', 'no need'),
('S00F26739', 'Sanjay S', '', 23, 'Male', '', '9952535674', '2026-04-25', '12:42:00', 'dental', 'receptioncompleted', 2, 'res1', 'Outpatient', 'karur', NULL, NULL, NULL, NULL, 138, NULL, NULL, 'asd', 'asdf', 'asdf', '271,subramaniya puram,mohanur', 'asdf', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patients_db`
--

CREATE TABLE `patients_db` (
  `phone_number` varchar(15) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `services` text NOT NULL,
  `visited` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `payment_id` int(11) NOT NULL,
  `method` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`payment_id`, `method`) VALUES
(5, 'cash'),
(6, 'g pay');

-- --------------------------------------------------------

--
-- Table structure for table `prescription_form`
--

CREATE TABLE `prescription_form` (
  `Name` varchar(20) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visited` int(100) NOT NULL,
  `Medicine` text NOT NULL,
  `moa` text DEFAULT NULL,
  `Timing` varchar(100) NOT NULL,
  `Duration` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procedure_done`
--

CREATE TABLE `procedure_done` (
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `Visted` varchar(100) DEFAULT NULL,
  `ProcedureDone` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procedure_done`
--

INSERT INTO `procedure_done` (`Phone_Number`, `Name`, `Visted`, `ProcedureDone`) VALUES
('9952535674', 'Sanjay S', '1', 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `radiographic_investigation`
--

CREATE TABLE `radiographic_investigation` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(50) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `Radiographic_investigation_Investigation` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `radiographic_investigation`
--

INSERT INTO `radiographic_investigation` (`Name`, `Phone_Number`, `Visted`, `Radiographic_investigation_Investigation`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `reception`
--

CREATE TABLE `reception` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reception`
--

INSERT INTO `reception` (`id`, `name`, `location`) VALUES
(6, 'res1', 'karur'),
(7, 'res1', 'karur');

-- --------------------------------------------------------

--
-- Table structure for table `roa`
--

CREATE TABLE `roa` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roa`
--

INSERT INTO `roa` (`id`, `name`) VALUES
(2, 'roa1'),
(3, 'roa2');

-- --------------------------------------------------------

--
-- Table structure for table `salivary_glands`
--

CREATE TABLE `salivary_glands` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `SalivaryGlands` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salivary_glands`
--

INSERT INTO `salivary_glands` (`Name`, `Phone_Number`, `Visted`, `SalivaryGlands`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `service_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `service_name`) VALUES
(16, 'dental'),
(17, 'general');

-- --------------------------------------------------------

--
-- Table structure for table `soft_tissues`
--

CREATE TABLE `soft_tissues` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `SoftTissues` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `soft_tissues`
--

INSERT INTO `soft_tissues` (`Name`, `Phone_Number`, `Visted`, `SoftTissues`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `surgical_history`
--

CREATE TABLE `surgical_history` (
  `Name` varchar(50) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visted` int(100) NOT NULL,
  `Surgical_History` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `surgical_history`
--

INSERT INTO `surgical_history` (`Name`, `Phone_Number`, `Visted`, `Surgical_History`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `sysexam`
--

CREATE TABLE `sysexam` (
  `id` int(11) NOT NULL,
  `sysexam_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sysexam`
--

INSERT INTO `sysexam` (`id`, `sysexam_text`) VALUES
(9, 'sys1'),
(10, 'sys2');

-- --------------------------------------------------------

--
-- Table structure for table `systemic_examination_form`
--

CREATE TABLE `systemic_examination_form` (
  `Name` varchar(20) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visited` int(100) NOT NULL,
  `sysexam_form` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `systemic_examination_form`
--

INSERT INTO `systemic_examination_form` (`Name`, `Phone_Number`, `Visited`, `sysexam_form`) VALUES
('Sanjay S', '9952535674', 1, 'sys2');

-- --------------------------------------------------------

--
-- Table structure for table `tests`
--

CREATE TABLE `tests` (
  `id` int(11) NOT NULL,
  `tests_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tests`
--

INSERT INTO `tests` (`id`, `tests_text`) VALUES
(15, 'test1'),
(16, 'test2');

-- --------------------------------------------------------

--
-- Table structure for table `test_to_take`
--

CREATE TABLE `test_to_take` (
  `Name` varchar(20) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visited` int(100) NOT NULL,
  `TestToTake` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_to_take`
--

INSERT INTO `test_to_take` (`Name`, `Phone_Number`, `Visited`, `TestToTake`) VALUES
('Sanjay S', '9952535674', 1, 'test2');

-- --------------------------------------------------------

--
-- Table structure for table `timing`
--

CREATE TABLE `timing` (
  `id` int(11) NOT NULL,
  `timing_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timing`
--

INSERT INTO `timing` (`id`, `timing_text`) VALUES
(2, 'tim1'),
(3, 'tim2');

-- --------------------------------------------------------

--
-- Table structure for table `tmj`
--

CREATE TABLE `tmj` (
  `Name` varchar(50) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Visted` int(100) DEFAULT NULL,
  `TMJ` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tmj`
--

INSERT INTO `tmj` (`Name`, `Phone_Number`, `Visted`, `TMJ`) VALUES
('Sanjay S', '9952535674', 1, 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `treatmentgiven`
--

CREATE TABLE `treatmentgiven` (
  `id` int(11) NOT NULL,
  `treatmentgiven_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatments`
--

CREATE TABLE `treatments` (
  `id` int(11) NOT NULL,
  `treatment_name_text` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `treatments`
--

INSERT INTO `treatments` (`id`, `treatment_name_text`) VALUES
(7, 'tg1'),
(8, 'tg2');

-- --------------------------------------------------------

--
-- Table structure for table `treatment_given_form`
--

CREATE TABLE `treatment_given_form` (
  `Name` varchar(20) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `Visited` int(100) NOT NULL,
  `Dosage` varchar(255) DEFAULT NULL,
  `Route_Of_Administration` varchar(255) DEFAULT NULL,
  `treatmentgivenname` varchar(255) DEFAULT NULL COMMENT 'Name of the treatment given'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `treatment_given_form`
--

INSERT INTO `treatment_given_form` (`Name`, `Phone_Number`, `Visited`, `Dosage`, `Route_Of_Administration`, `treatmentgivenname`) VALUES
('Sanjay S', '9952535674', 1, 'dos1', 'roa1', 'tra');

-- --------------------------------------------------------

--
-- Table structure for table `treatment_plan`
--

CREATE TABLE `treatment_plan` (
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `Visted` varchar(100) DEFAULT NULL,
  `TreatmentPlan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `treatment_plan`
--

INSERT INTO `treatment_plan` (`Phone_Number`, `Name`, `Visted`, `TreatmentPlan`) VALUES
('9952535674', 'Sanjay S', '1', 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `uploaded_files`
--

CREATE TABLE `uploaded_files` (
  `id` int(11) NOT NULL,
  `Phone_Number` varchar(20) DEFAULT NULL,
  `Visted` int(11) DEFAULT NULL,
  `FilePath` text DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `File_Name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userphotos`
--

CREATE TABLE `userphotos` (
  `id` int(11) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `visted` int(11) NOT NULL,
  `photo_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userphotos`
--

INSERT INTO `userphotos` (`id`, `phone_number`, `visted`, `photo_path`) VALUES
(131, '9952535674', 1, 'userphotos/9952535674_1.jpeg'),
(132, '9952535674', 2, 'userphotos/9952535674_2.png'),
(133, '1234567890', 1, 'userphotos/1234567890_1.png');

-- --------------------------------------------------------

--
-- Table structure for table `users_database`
--

CREATE TABLE `users_database` (
  `UserName` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `roll` varchar(255) NOT NULL,
  `Location` varchar(255) NOT NULL,
  `Phone_Number` varchar(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_database`
--

INSERT INTO `users_database` (`UserName`, `Password`, `roll`, `Location`, `Phone_Number`, `name`) VALUES
('admin', 'admin', 'admin', 'karur', NULL, 'admin'),
('billing@ukamirthaadental.com', '123', 'reception', 'uk', '8667044444', 'ukreception'),
('billing@usaamirthaadental.com', '123', 'reception', 'usa', '8667086670', 'usa reception'),
('dindiguldoctor', 'doctor', 'doctor', 'Dindigul', NULL, 'din doctor'),
('doctor', 'doctor', 'doctor', 'karur', NULL, 'krr doc'),
('doctor@erode.com', '123', 'doctor', 'Erode', '9042258952', 'er doc'),
('doctor@karur.com', 'manivannan', 'doctor', 'Karur Zone 1', NULL, 'krr1 doc1'),
('doctor@maduraiamirthaadental.com', 'prasanna', 'doctor', 'Madurai', NULL, 'madurai doc'),
('doctor@paduramirthaadental.com', '123', 'doctor', 'Padur', '8667044451', 'padur doc'),
('doctor@ukamirthaadental.com', '123', 'doctor', 'uk', '123', 'uk doc'),
('doctor@usaamirthaadental.com', '123', 'doctor', 'usa', '8667087129879', 'usa doc'),
('erodedoctor', 'doctor', 'doctor', 'Erode', NULL, 'er doc2'),
('ewr', 'wer', 'doctor', 'karur', NULL, 'krr doc3'),
('nurse', 'nurse', 'nurse', 'karur', NULL, 'krr nurse'),
('nurse@erode.com', '123', 'nurse', 'Erode', '9042258951', 'er nurse'),
('nurse@karur.com', 'manivannan', 'nurse', 'Karur Zone 1', NULL, 'krr1 nurse'),
('nurse@ukamirthaadental.com', '123', 'nurse', 'uk', '8667044422', 'uk nurse'),
('nurse@usaamirthaadental.com', '123', 'nurse', 'usa', '8667086671', 'usa nurse'),
('reception', 'reception', 'reception', 'karur', NULL, 'krr reception'),
('reception@erode.com', '123', 'reception', 'Erode', '9042258955', 'er reception'),
('reception@karur.com', 'manivannan', 'reception', 'Karur Zone 1', NULL, 'krr1 reception'),
('sdfasdf', '123456789', 'doctor', 'salem', NULL, 'salem doc'),
('testingadd', 'add123', 'doctor', 'karur', NULL, 'krr doc 2'),
('tewtingitkerom', 'wer', 'doctor', 'karur', NULL, 'krr doc1');

-- --------------------------------------------------------

--
-- Table structure for table `vaccine`
--

CREATE TABLE `vaccine` (
  `id` int(11) NOT NULL,
  `vaccine_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vitals`
--

CREATE TABLE `vitals` (
  `Name` varchar(225) DEFAULT NULL,
  `Blood Type` varchar(255) DEFAULT NULL,
  `Visit` varchar(255) DEFAULT NULL,
  `Phone_number` varchar(255) DEFAULT NULL,
  `Height` varchar(255) DEFAULT NULL,
  `Weight` varchar(255) DEFAULT NULL,
  `Temp` varchar(255) DEFAULT NULL,
  `sugar` varchar(255) DEFAULT NULL,
  `BP` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vitals`
--

INSERT INTO `vitals` (`Name`, `Blood Type`, `Visit`, `Phone_number`, `Height`, `Weight`, `Temp`, `sugar`, `BP`) VALUES
('Sanjay S', 'sdfg', '1', '9952535674', 'sdg', 'sdfg', 'sdfg', 'sdfg', 'asg'),
('sam', 'adf', '1', '1234567890', 'adf', 'asdf', 'asdf', 'asdf', 'asdf');

-- --------------------------------------------------------

--
-- Table structure for table `vitals_database`
--

CREATE TABLE `vitals_database` (
  `id` int(11) NOT NULL,
  `vitals_text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advicegiven`
--
ALTER TABLE `advicegiven`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `billing_details`
--
ALTER TABLE `billing_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `billing_id` (`billing_id`);

--
-- Indexes for table `billing_headers`
--
ALTER TABLE `billing_headers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dental_values`
--
ALTER TABLE `dental_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctors_name`
--
ALTER TABLE `doctors_name`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dosage`
--
ALTER TABLE `dosage`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drugs`
--
ALTER TABLE `drugs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `duration`
--
ALTER TABLE `duration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `manage_membership`
--
ALTER TABLE `manage_membership`
  ADD UNIQUE KEY `unique_member` (`Phone_Number`,`visit`);

--
-- Indexes for table `memberships`
--
ALTER TABLE `memberships`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `moa`
--
ALTER TABLE `moa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nurses_name`
--
ALTER TABLE `nurses_name`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `onexam`
--
ALTER TABLE `onexam`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `particular`
--
ALTER TABLE `particular`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `queue` (`queue`);

--
-- Indexes for table `patients_db`
--
ALTER TABLE `patients_db`
  ADD PRIMARY KEY (`phone_number`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `reception`
--
ALTER TABLE `reception`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roa`
--
ALTER TABLE `roa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sysexam`
--
ALTER TABLE `sysexam`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tests`
--
ALTER TABLE `tests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timing`
--
ALTER TABLE `timing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `treatmentgiven`
--
ALTER TABLE `treatmentgiven`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `userphotos`
--
ALTER TABLE `userphotos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users_database`
--
ALTER TABLE `users_database`
  ADD UNIQUE KEY `UserName` (`UserName`),
  ADD UNIQUE KEY `unique_name` (`name`);

--
-- Indexes for table `vaccine`
--
ALTER TABLE `vaccine`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vitals_database`
--
ALTER TABLE `vitals_database`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advicegiven`
--
ALTER TABLE `advicegiven`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `billing_details`
--
ALTER TABLE `billing_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `dental_values`
--
ALTER TABLE `dental_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `doctors_name`
--
ALTER TABLE `doctors_name`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `dosage`
--
ALTER TABLE `dosage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `drugs`
--
ALTER TABLE `drugs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `duration`
--
ALTER TABLE `duration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `memberships`
--
ALTER TABLE `memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `moa`
--
ALTER TABLE `moa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `nurses_name`
--
ALTER TABLE `nurses_name`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `onexam`
--
ALTER TABLE `onexam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `particular`
--
ALTER TABLE `particular`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `queue` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reception`
--
ALTER TABLE `reception`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `roa`
--
ALTER TABLE `roa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sysexam`
--
ALTER TABLE `sysexam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tests`
--
ALTER TABLE `tests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `timing`
--
ALTER TABLE `timing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `treatmentgiven`
--
ALTER TABLE `treatmentgiven`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `treatments`
--
ALTER TABLE `treatments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `userphotos`
--
ALTER TABLE `userphotos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `vaccine`
--
ALTER TABLE `vaccine`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vitals_database`
--
ALTER TABLE `vitals_database`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
