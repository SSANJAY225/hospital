const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { exec } = require('child_process');
const util = require('util');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const allowedOrigins = [
  "http://localhost:3000", // Development
  "https://app.amirthaahospital.com" // Production
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials:true
}));
app.use(express.json());
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "visualpl_zfitbot"
});
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "visualpl_zfitbotusername",
//   password: "zfit@3839",
//   database: "visualpl_zfitbot",
//   connectionLimit: 10
// });

const JWT_SECRET = "Tailore";
const invalidTokens = new Set();

const isauth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const tokenBlacklistCheck = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  if (invalidTokens.has(token)) {
    return res.status(401).json({ message: "Unauthorized: Token is invalid or expired" });
  }
  next();
};

//                                                                   Promisify exec for async/await
const execPromise = util.promisify(exec);

// Backup endpoint
app.get('/api/backup', isauth, async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sqlFile = `backup-${timestamp}.sql`;
  const zipFile = `backup-${timestamp}.zip`;
  const sqlFilePath = path.join(__dirname, sqlFile);
  const zipFilePath = path.join(__dirname, zipFile);

  try {
    // Step 1: Export MySQL database using mysqldump
    const mysqldumpCommand = `mysqldump -u ${db.config.user} -p${db.config.password} --databases ${db.config.database} > ${sqlFilePath}`;
    await execPromise(mysqldumpCommand);

    // Verify SQL file was created
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Failed to create SQL dump');
    }

    // Step 2: Create ZIP file
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle errors during archiving
    archive.on('error', (err) => {
      throw err;
    });

    // Pipe archive to file
    archive.pipe(output);

    // Add SQL file to ZIP
    archive.file(sqlFilePath, { name: sqlFile });

    // Add server folders to ZIP
    const folders = ['bills', 'userphotos', 'uploads', 'usersfiles'];
    folders.forEach(folder => {
      const folderPath = path.join(__dirname, folder);
      if (fs.existsSync(folderPath)) {
        archive.directory(folderPath, folder);
      } else {
        console.warn(`Folder ${folder} does not exist, skipping...`);
      }
    });

    // Finalize the archive
    await archive.finalize();

    // Wait for the output stream to close
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    // Step 3: Send ZIP file to client
    res.setHeader('Content-Disposition', `attachment; filename="${zipFile}"`);
    res.setHeader('Content-Type', 'application/zip');

    const fileStream = fs.createReadStream(zipFilePath);
    fileStream.pipe(res);

    // Clean up files after streaming
    fileStream.on('end', () => {
      fs.unlink(sqlFilePath, (err) => {
        if (err) console.error('Error deleting SQL file:', err);
      });
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error('Error deleting ZIP file:', err);
      });
    })
    fileStream.on('error', (error) => {
      console.error('Error streaming ZIP file:', error);
      res.status(500).json({ success: false, message: 'Error downloading backup' });
    })
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, message: 'Failed to create backup' });

    // Clean up any created files in case of error
    if (fs.existsSync(sqlFilePath)) fs.unlinkSync(sqlFilePath);
    if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
  }
});

// Endpoint to save the bill PDF
app.post('/api/save-bill-pdf', (req, res) => {
  const { pdfData, filename, userId, visitNumber } = req.body;

  if (!pdfData || !filename || !userId || !visitNumber) {
    return res.status(400).json({ success: false, message: 'pdfData, filename, userId, and visitNumber are required' });
  }

  // Define the storage directory (e.g., ./bills)
  const dir = './bills';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Decode Base64 and save the file
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(pdfData, 'base64');
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving PDF:', err);
      return res.status(500).json({ success: false, message: 'Failed to save PDF' });
    }

    // Optionally, you could store the file path in a database with userId and visitNumber
    console.log(`PDF saved at: ${filePath}`);
    res.json({ success: true, message: 'PDF saved successfully', filePath });
  });
});


app.get('/api/download-bill', (req, res) => {
  const { phone_number, visted } = req.query;

  if (!phone_number || !visted) {
    return res.status(400).json({ success: false, message: 'phone_number and visted are required' });
  }

  // Construct the filename based on the pattern used earlier
  const filename = `bill_${phone_number}_${visted}.pdf`;
  const filePath = path.join(__dirname, 'bills', filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ success: false, message: 'Error downloading bill' });
    });
  });
});

// Existing endpoints remain unchanged
app.post('/api/save-bill-pdf', (req, res) => {
  const { pdfData, filename, userId, visitNumber } = req.body;

  if (!pdfData || !filename || !userId || !visitNumber) {
    return res.status(400).json({ success: false, message: 'pdfData, filename, userId, and visitNumber are required' });
  }

  const dir = './bills';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(pdfData, 'base64');
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving PDF:', err);
      return res.status(500).json({ success: false, message: 'Failed to save PDF' });
    }

    console.log(`PDF saved at: ${filePath}`);
    res.json({ success: true, message: 'PDF saved successfully', filePath });
  });
});

app.post('/login', (req, res) => {
  const { loginLocation, password } = req.body;
  const sql = "SELECT * FROM users_database WHERE UserName = ? AND Password = ?";
  db.query(sql, [loginLocation, password], (err, results) => {
    if (err) {
      console.error('Error executing login query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      // Send 'INVALID_PASSWORD' error if no user found
      res.status(401).json({ error: 'INVALID_PASSWORD' });
      return;
    }

    // Assuming these are the column names in your users table
    const { Country, State, District, Area, Location, roll } = results[0];
    const token = jwt.sign(
      { loginLocation: results[0].UserName, roll: results[0].roll, frachiselocation: results[0].Location },
      JWT_SECRET,
      { expiresIn: '3h' }
    );
    res.json({
      success: true,
      country: Country,
      state: State,
      district: District,
      area: Area,
      franchiselocation: Location,
      token: token,
      roll: roll
    });
  });
});
// Error handler middleware
function handleError(err, res, message) {
  console.error(message, err);
  return res.status(500).json({ error: message });
}

// Add Data to Complaints
app.post('/addComplaints', (req, res) => {
  const { complaint } = req.body;
  console.log('Request body:', req.body);  // Log the request body

  if (!complaint) {
    return res.status(400).json({ error: 'Complaint is required' });
  }

  const sql = 'INSERT INTO complaints (complaint_text) VALUES (?)';
  db.query(sql, [complaint], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add complaint');
    res.json({ message: 'Complaint added successfully', id: results.insertId });
  });
});
// get compalints
app.get('/getComplaints', (req, res) => {
  const sql = "SELECT complaint_text FROM complaints";
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to get complaints');
    res.json(results.map((row) => row.complaint_text))
  })
})
// get compalintsq
app.get('/getRoA', (req, res) => {
  const sql = "SELECT name FROM roa"
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to get Route of Administration')
    res.json(results.map((row) => row.name))
  })
})

// Add RoA
app.post('/addRoA', (req, res) => {
  const { RoA } = req.body;
  console.log('Request body:', req.body);  // Log the request body
  if (!RoA) {
    return res.status(400).json({ error: 'Complaint is required' });
  }
  const sql = 'INSERT INTO roa (name) VALUES (?)';
  db.query(sql, [RoA], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add complaint');
    res.json({ message: 'Route of adminstartion added successfully', id: results.insertId });
  });
})
// vitals 
// add vitals
app.post("/addvitals", (req, res) => {
  let { vitals } = req.body;

  if (!vitals) {
    return res.status(400).json({ message: "Vitals field is required" });
  }

  const sql = `ALTER TABLE vitals ADD COLUMN \`${vitals}\` VARCHAR(255)`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error altering table:", err);
      return res.status(500).json({ message: "Failed to alter table", error: err.message });
    }
    res.json({ message: "Column added successfully!" });
  });
});

// get vitals 
app.get("/column-vitals", (req, res) => {
  const sql = "SHOW COLUMNS FROM vitals";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching columns:", err);
      return res.status(500).json({ message: "Failed to retrieve columns" });
    }

    // List of columns to ignore (exact database column names)
    const ignoredColumns = ["Name", "Visit", "Phone_number"];

    // Filter out ignored columns first, then replace underscores with spaces
    const columnNames = results
      .map((column) => column.Field)
      .filter((col) => !ignoredColumns.includes(col))
      .map((col) => col.replace("_", " "));

    console.log("Returning columns:", columnNames); // Debug log
    res.json(columnNames);
  });
});

// edit vitals
app.put("/editvitasl/:name", (req, res) => {
  const { name } = req.params;
  let { newName } = req.body;
  // newName = newName.replace(/\s+/g, "_");
  const sql = `ALTER TABLE Vitals CHANGE COLUMN ${name} ${newName} VARCHAR(225)`
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error changing column:", err);
      return res.status(500).json({ message: "Failed to change column" });
    }
    res.json({ message: "Column name updated successfully!" });
  })
})
// Delete column name
app.delete("/api/delete-column/:columnName", (req, res) => {
  let { columnName } = req.params;
  // columnName = columnName.replace(" ", "_")
  if (!columnName) {
    return res.status(400).json({ message: "Column name is required" });
  }
  const sql = `ALTER TABLE Vitals DROP COLUMN \`${columnName}\``;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error deleting column:", err);
      return res.status(500).json({ message: "Failed to delete column" });
    }
    res.json({ message: `Column ${columnName} deleted successfully!` });
  });
});

app.delete('/delete-user/:phone_number', (req, res) => {
  const phoneNumber = req.params.phone_number;

  // SQL query to delete user from users_databases table
  const query = 'DELETE FROM users_database WHERE Phone_Number = ?';

  db.query(query, [phoneNumber], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  });
});

app.put("/update-data", (req, res) => {
  const formData = req.body;
  console.log("Received update data:", formData);

  // Extract required fields
  const phoneNumber = formData.vitals?.Phone_number || formData.Phone_number;
  const name = formData.vitals?.Name || formData.name;
  const visit = formData.vitals?.Visit || formData.visited;
  const nurseName = formData.nurseName || null;
  const majorComplaints = formData.majorComplaints || null;
  const vitals = formData.vitals || {};

  // Validate required fields
  if (!phoneNumber || !name || !visit) {
    console.warn("Missing required fields:", { phoneNumber, name, visit });
    return res.status(400).json({
      message: "Missing required fields: Phone_number, Name, or Visit",
    });
  }

  // Start a transaction to ensure atomic updates
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ message: "Database transaction error", error: err.message });
    }

    // Step 1: Update patients table (nursename, status, entrydate)
    const updatePatientsSql = `
      UPDATE patients 
      SET nursename = ?, 
          status = 'nursecompleted',
          entrydate = CURDATE()
      WHERE phone_number = ? 
      AND visted = ?`;
    const updatePatientsValues = [nurseName, phoneNumber, visit];

    db.query(updatePatientsSql, updatePatientsValues, (err, patientsResult) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error updating patients table:", err);
          res.status(500).json({ message: "Database error updating patients table", error: err.message });
        });
      }

      if (patientsResult.affectedRows === 0) {
        return db.rollback(() => {
          console.warn("No rows updated in patients table", { phoneNumber, visit, nurseName });
          res.status(404).json({
            message: "No matching patient found to update",
            details: `phone_number: ${phoneNumber}, Visit: ${visit}`,
          });
        });
      }

      console.log("Updated patients table:", patientsResult);

      // Step 2: Update or insert into general_patient table (Major_Complaints)
      const checkGeneralPatientSql = `
        SELECT * FROM general_patient 
        WHERE Phone_Number = ? AND visted = ?`;
      db.query(checkGeneralPatientSql, [phoneNumber, visit], (err, generalPatientResult) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error checking general_patient table:", err);
            res.status(500).json({ message: "Database error checking general_patient table", error: err.message });
          });
        }

        if (generalPatientResult.length > 0) {
          // Update existing record
          const updateGeneralSql = `
            UPDATE general_patient 
            SET Major_Complaints = ?, Name = ?
            WHERE Phone_Number = ? AND visted = ?`;
          const updateGeneralValues = [majorComplaints, name, phoneNumber, visit];

          db.query(updateGeneralSql, updateGeneralValues, (err, updateGeneralResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error updating general_patient table:", err);
                res.status(500).json({ message: "Database error updating general_patient table", error: err.message });
              });
            }
            console.log("Updated general_patient table:", updateGeneralResult);
            updateVitals();
          });
        } else {
          // Insert new record
          const insertGeneralSql = `
            INSERT INTO general_patient (Name, Phone_Number, visted, Major_Complaints) 
            VALUES (?, ?, ?, ?)`;
          const insertGeneralValues = [name, phoneNumber, visit, majorComplaints];

          db.query(insertGeneralSql, insertGeneralValues, (err, insertGeneralResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error inserting into general_patient table:", err);
                res.status(500).json({ message: "Database error inserting general_patient table", error: err.message });
              });
            }
            console.log("Inserted into general_patient table:", insertGeneralResult);
            updateVitals();
          });
        }
      });

      // Step 3: Update or insert into vitals table
      function updateVitals() {
        // Get vitals table columns
        db.query(`SHOW COLUMNS FROM vitals`, (err, results) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error fetching vitals columns:", err);
              res.status(500).json({ message: "Database error fetching vitals columns", error: err.message });
            });
          }

          const fields = results.map((itm) => itm.Field);
          console.log("Vitals columns:", fields);

          // Check if vitals record exists
          const checkVitalsSql = `
            SELECT * FROM vitals 
            WHERE Phone_number = ? AND Visit = ?`;
          db.query(checkVitalsSql, [phoneNumber, visit], (err, vitalsResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error checking vitals table:", err);
                res.status(500).json({ message: "Database error checking vitals table", error: err.message });
              });
            }

            // Prepare vitals data
            const vitalsValues = fields.map((field) => {
              const value = vitals[field] || null;
              return value !== undefined ? value : null;
            });

            if (vitalsResult.length > 0) {
              // Update existing vitals record
              const updateVitalsSql = `
                UPDATE vitals 
                SET ${fields.map((field) => `\`${field}\` = ?`).join(", ")}
                WHERE Phone_number = ? AND Visit = ?`;
              const updateVitalsValues = [...vitalsValues, phoneNumber, visit];

              db.query(updateVitalsSql, updateVitalsValues, (err, updateVitalsResult) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Error updating vitals table:", err);
                    res.status(500).json({ message: "Database error updating vitals table", error: err.message });
                  });
                }
                console.log("Updated vitals table:", updateVitalsResult);
                commitTransaction();
              });
            } else {
              // Insert new vitals record
              const insertVitalsSql = `
                INSERT INTO vitals (${fields.map((field) => `\`${field}\``).join(", ")}) 
                VALUES (${fields.map(() => "?").join(", ")})`;
              db.query(insertVitalsSql, vitalsValues, (err, insertVitalsResult) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Error inserting into vitals table:", err);
                    res.status(500).json({ message: "Database error inserting vitals table", error: err.message });
                  });
                }
                console.log("Inserted into vitals table:", insertVitalsResult);
                commitTransaction();
              });
            }
          });
        });
      }

      // Commit transaction
      function commitTransaction() {
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).json({ message: "Database transaction commit error", error: err.message });
            });
          }
          console.log("Transaction committed successfully");
          res.status(200).json({
            message: "Data updated successfully",
            updated_patients_rows: patientsResult.affectedRows,
          });
        });
      }
    });
  });
});


app.post("/adddata-vitals", (req, res) => {
  console.log("Received data for vitals san:", req.body);

  db.query(`SHOW COLUMNS FROM vitals`, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    const fields = results.map((itm) => itm.Field);
    console.log("Database columns:", fields);

    // Validate required fields
    const requiredFields = ['Name', 'Phone_number', 'Visit'];
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field] === '') {
        console.warn(`Missing or empty required field: ${field}`);
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // Map request body to database fields
    const values = fields.map((field) => {
      const value = req.body[field];
      console.log(`Field: ${field}, Value: ${value}`);
      return value !== undefined ? value : null;
    });

    // Check if any non-required fields have valid data
    const hasValidData = values.some((val, idx) => !requiredFields.includes(fields[idx]) && val !== null);
    if (!hasValidData && values.filter((val, idx) => requiredFields.includes(fields[idx])).every((val) => val === null)) {
      console.warn("No valid data provided beyond required fields");
      return res.status(400).json({ message: "Invalid request: No valid data provided" });
    }

    // Escape column names with backticks
    const escapedFields = fields.map((field) => `\`${field}\``);
    const sql = `INSERT INTO vitals (${escapedFields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`;

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      console.log("Inserted Data:", result);
      res.json({ message: "Data inserted successfully", id: result.insertId });
    });
  });
});

// get vitals
app.get("/getvitals/:Name/:Visit/:Phone_number", (req, res) => {
  const { Name, Visit, Phone_number } = req.params;
  console.log(`Received request: Name=${Name}, Visit=${Visit}, Phone_number=${Phone_number}`);

  const query = `SELECT * FROM vitals WHERE Name = ? AND Visit = ? AND Phone_number = ?`;

  db.query(query, [Name, Visit, Phone_number], (err, result) => {
    if (err) {
      console.error("Database Query Error:", err);
      console.log(query)
      return res.status(500).json({ error: err.message });
    }
    // List of columns to ignore
    const ignoredColumns = ["Name", "Visit", "Phone_number"];
    // Function to format keys and remove ignored columns
    const formatKeys = (obj) => {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([key]) => !ignoredColumns.includes(key)) // Remove ignored columns
          .map(([key, value]) => [key.replace(/_/g, " "), value]) // Replace underscores with spaces
      );
    };

    const formattedResult = result.map(formatKeys);
    console.log("Formatted Query Result:", formattedResult);

    return res.json(formattedResult);
  });
});



app.get('/get-major/:Name/:Visted/:Phone_Number', (req, res) => {
  const { Name, Phone_Number, Visted } = req.params;
  console.log(req.params)
  const query = `SELECT Major_Complaints FROM general_patient WHERE Name = ? AND Phone_Number = ? AND Visted=?`
  db.query(query, [Name, Phone_Number, Visted], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching data' });
    }
    else {
      console.log(result)
      res.json(result);
    }
  })
})


// Add Data to Examination
app.post('/addExamination', (req, res) => {
  const { examination } = req.body;
  if (!examination) {
    return res.status(400).json({ error: 'Examination is required' });
  }

  const sql = 'INSERT INTO onexam (onexam_text) VALUES (?)';
  db.query(sql, [examination], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add examination');
    res.json({ message: 'Examination added successfully', id: results.insertId });
  });
});




// Add Data to SystemicExamination
app.post('/addSystemicExamination', (req, res) => {
  const { systemicExamination } = req.body;
  if (!systemicExamination) {
    return res.status(400).json({ error: 'Systemic Examination is required' });
  }

  const sql = 'INSERT INTO sysexam (sysexam_text) VALUES (?)';
  db.query(sql, [systemicExamination], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add systemic examination');
    res.json({ message: 'Systemic Examination added successfully', id: results.insertId });
  });
});
app.post('/addDental', (req, res) => {
  console.log('Received request:', req.body); // Log request body

  const { dental } = req.body;
  if (!dental) {
    console.error('Missing dental field');
    return res.status(400).json({ error: 'Dental field is required' });
  }

  const sql = 'INSERT INTO dental_values (dental_text) VALUES (?)';
  db.query(sql, [dental], (err, results) => {
    if (err) {
      console.error('Database error:', err); // Log MySQL errors
      return res.status(500).json({ error: 'Failed to add dental record' });
    }
    res.json({ message: 'Dental record added successfully', id: results.insertId });
  });
});

// Backend: Fetch dental values from dental_values table
app.get('/api/dental-suggestions', (req, res) => {
  const sql = 'SELECT dental_text FROM dental_values';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch dental values' });
    }
    const dentalValues = results.map(row => row.dental_text);
    res.json(dentalValues);
  });
});

// Add Data to Tests
app.post('/addTests', (req, res) => {
  const { test } = req.body;
  if (!test) {
    return res.status(400).json({ error: 'Test is required' });
  }

  const sql = 'INSERT INTO tests (tests_text) VALUES (?)';
  db.query(sql, [test], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add test');
    res.json({ message: 'Test added successfully', id: results.insertId });
  });
});

// Add Data to TreatmentGiven
app.post('/addTreatmentGiven', (req, res) => {
  const { treatment } = req.body;
  if (!treatment) {
    return res.status(400).json({ error: 'Treatment is required' });
  }

  const sql = 'INSERT INTO treatments (treatment_name_text) VALUES (?)';
  db.query(sql, [treatment], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add treatment');
    res.json({ message: 'Treatment added successfully', id: results.insertId });
  });
});

// Add Data to Drugs
app.post('/addDrugs', (req, res) => {
  const { drug } = req.body;
  if (!drug) {
    return res.status(400).json({ error: 'Drug is required' });
  }

  const sql = 'INSERT INTO drugs (drugs_text) VALUES (?)';
  db.query(sql, [drug], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add drug');
    res.json({ message: 'Drug added successfully', id: results.insertId });
  });
});

// Add Data to Dosage
app.post('/addDosage', (req, res) => {
  const { dosage } = req.body;
  if (!dosage) {
    return res.status(400).json({ error: 'Dosage is required' });
  }

  const sql = 'INSERT INTO dosage (dosage_text) VALUES (?)';
  db.query(sql, [dosage], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add dosage');
    res.json({ message: 'Dosage added successfully', id: results.insertId });
  });
});

// Add Data to Timing
app.post('/addTiming', (req, res) => {
  const { timing } = req.body;
  if (!timing) {
    return res.status(400).json({ error: 'Timing is required' });
  }

  const sql = 'INSERT INTO timing (timing_text) VALUES (?)';
  db.query(sql, [timing], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add timing');
    res.json({ message: 'Timing added successfully', id: results.insertId });
  });
});

// Add Data to Duration
app.post('/addDuration', (req, res) => {
  const { duration } = req.body;
  if (!duration) {
    return res.status(400).json({ error: 'Duration is required' });
  }

  const sql = 'INSERT INTO duration (duration_text) VALUES (?)';
  db.query(sql, [duration], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add duration');
    res.json({ message: 'Duration added successfully', id: results.insertId });
  });
});

// Add Data to AdviceGiven
app.post('/addAdviceGiven', (req, res) => {
  const { advice } = req.body;
  if (!advice) {
    return res.status(400).json({ error: 'Advice is required' });
  }

  const sql = 'INSERT INTO advicegiven (advicegiven_text) VALUES (?)';
  db.query(sql, [advice], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add advice');
    res.json({ message: 'Advice added successfully', id: results.insertId });
  });
});

// Add Data to Vaccine
app.post('/addVaccine', (req, res) => {
  const { vaccine } = req.body;
  if (!vaccine) {
    return res.status(400).json({ error: 'Vaccine is required' });
  }

  const sql = 'INSERT INTO vaccine (vaccine_text) VALUES (?)';
  db.query(sql, [vaccine], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add vaccine');
    res.json({ message: 'Vaccine added successfully', id: results.insertId });
  });
});
/////////////////////////////////////////MANAGING THE THINGS///////////////////////////////////////////////////

// Fetch all complaints
app.get('/complaints', (req, res) => {
  const sql = 'SELECT * FROM complaints';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch complaints');
    res.json(results);
  });
});

// Update a complaint
app.put('/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { complaint_text } = req.body;

  if (!complaint_text) {
    return res.status(400).json({ error: 'Complaint text is required' });
  }

  const sql = 'UPDATE complaints SET complaint_text = ? WHERE id = ?';
  db.query(sql, [complaint_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update complaint');
    res.json({ message: 'Complaint updated successfully' });
  });
});

// Delete a complaint
app.delete('/complaints/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM complaints WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete complaint');
    res.json({ message: 'Complaint deleted successfully' });
  });
});



// Fetch all vitals
app.get('/vitals', (req, res) => {
  const sql = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'vitals' 
    AND COLUMN_NAME NOT IN ('Name', 'Visit', 'Phone_number')
  `;
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch columns');
    const columns = results.map(row => row.COLUMN_NAME);
    console.log('Columns fetched from database:', columns);
    res.json(columns);
  });
});

// POST a new column
app.post('/vitals', (req, res) => {
  const { columnName } = req.body;

  if (!columnName || columnName.trim() === '') {
    console.error('Invalid column name:', columnName);
    return res.status(400).json({ message: 'Column name is required and cannot be empty' });
  }

  if (['Name', 'Visit', 'Phone_number'].includes(columnName)) {
    return res.status(400).json({ message: 'Column name cannot be Name, Visit, or Phone_number' });
  }

  const sql = `ALTER TABLE vitals ADD \`${columnName}\` VARCHAR(255)`;
  db.query(sql, (err, result) => {
    if (err) return handleError(err, res, 'Failed to add column');
    console.log('Column added:', { columnName });
    res.status(201).json({ message: 'Column added successfully', columnName });
  });
});

// PUT (update) a column name
app.put('/vitals/:column', (req, res) => {
  const { column } = req.params;
  const { newColumnName } = req.body;

  if (!newColumnName || newColumnName.trim() === '') {
    console.error('Invalid new column name:', newColumnName);
    return res.status(400).json({ message: 'New column name is required and cannot be empty' });
  }

  if (['Name', 'Visit', 'Phone_number'].includes(newColumnName)) {
    return res.status(400).json({ message: 'New column name cannot be Name, Visit, or Phone_number' });
  }

  const sql = `ALTER TABLE vitals CHANGE \`${column}\` \`${newColumnName}\` VARCHAR(255)`;
  db.query(sql, (err, result) => {
    if (err) return handleError(err, res, 'Failed to update column');
    console.log('Column updated:', { oldName: column, newName: new OLD_NAME });
    res.json({ message: 'Column updated successfully' });
  });
});

// DELETE a column
app.delete('/vitals/:column', (req, res) => {
  const { column } = req.params;

  const sql = `ALTER TABLE vitals DROP COLUMN \`${column}\``;
  db.query(sql, (err, result) => {
    if (err) return handleError(err, res, 'Failed to delete column');
    console.log('Column deleted:', { column });
    res.json({ message: 'Column deleted successfully' });
  });
});

app.get('/examinations', (req, res) => {
  const sql = 'SELECT * FROM onexam';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch examinations');
    console.log('Examinations fetched from database:', results); // Debugging line
    res.json(results);
  });
});

app.get('/api/receptionists', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing "name" query parameter' });
  }

  const query = `
    SELECT receptionistname
    FROM receptionist
    WHERE receptionistname LIKE ?
    LIMIT 10
  `;
  console.log('Received request for receptionist name:', name);
  console.log('Query:', query, 'with parameter:', `${name}%`);

  db.query(query, [`${name}%`], (err, results) => {
    if (err) {
      console.error('Error fetching receptionists:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ data: results });
  });
});

// Update an examination
app.put('/examinations/:id', (req, res) => {
  const { id } = req.params;
  const { examination_text } = req.body;

  console.log('Received request body:', req.body); // Debugging line

  if (!examination_text) {
    return res.status(400).json({ error: 'Examination text is required' });
  }

  const sql = 'UPDATE onexam SET onexam_text = ? WHERE id = ?';
  db.query(sql, [examination_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update examination');
    res.json({ message: 'Examination updated successfully' });
  });
});

// Delete an examination
app.delete('/examinations/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM onexam WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete examination');
    res.json({ message: 'Examination deleted successfully' });
  });
});

app.get('/sysexaminations', (req, res) => {
  const sql = 'SELECT * FROM sysexam';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch systematic examinations');
    console.log('Systematic examinations fetched from database:', results); // Debugging line
    res.json(results);
  });
});

// Update a systematic examination
app.put('/sysexaminations/:id', (req, res) => {
  const { id } = req.params;
  const { sysexam_text } = req.body;

  if (!sysexam_text) {
    return res.status(400).json({ error: 'Systematic examination text is required' });
  }

  const sql = 'UPDATE sysexam SET sysexam_text = ? WHERE id = ?';
  db.query(sql, [sysexam_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update systematic examination');
    res.json({ message: 'Systematic examination updated successfully' });
  });
});

// Delete a systematic examination
app.delete('/sysexaminations/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM sysexam WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete systematic examination');
    res.json({ message: 'Systematic examination deleted successfully' });
  });
});


// Fetch all tests
app.get('/tests', (req, res) => {
  const sql = 'SELECT * FROM tests';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch tests');
    console.log('Tests fetched from database:', results);
    res.json(results);
  });
});

// Update a test
app.put('/tests/:id', (req, res) => {
  const { id } = req.params;
  const { tests_text } = req.body;

  if (!tests_text) {
    return res.status(400).json({ error: 'Test text is required' });
  }

  const sql = 'UPDATE tests SET tests_text = ? WHERE id = ?';
  db.query(sql, [tests_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update test');
    res.json({ message: 'Test updated successfully' });
  });
});

// Delete a test
app.delete('/tests/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tests WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete test');
    res.json({ message: 'Test deleted successfully' });
  });
});


// Fetch all treatments
app.get('/treatmentgiven', (req, res) => {
  const sql = 'SELECT * FROM treatmentgiven';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch treatments');
    console.log('Treatments fetched from database:', results);
    res.json(results);
  });
});

// Update a treatment
app.put('/treatmentgiven/:id', (req, res) => {
  const { id } = req.params;
  const { treatmentgiven_text } = req.body;

  if (!treatmentgiven_text) {
    return res.status(400).json({ error: 'Treatment text is required' });
  }

  const sql = 'UPDATE treatmentgiven SET treatmentgiven_text = ? WHERE id = ?';
  db.query(sql, [treatmentgiven_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update treatment');
    res.json({ message: 'Treatment updated successfully' });
  });
});

// Delete a treatment
app.delete('/treatmentgiven/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM treatmentgiven WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete treatment');
    res.json({ message: 'Treatment deleted successfully' });
  });
});

// Fetch all drugs
app.get('/drugs', (req, res) => {
  const sql = 'SELECT * FROM drugs';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch drugs');
    console.log('Drugs fetched from database:', results);
    res.json(results);
  });
});

// Update a drug
app.put('/drugs/:id', (req, res) => {
  const { id } = req.params;
  const { drugs_text } = req.body;

  if (!drugs_text) {
    return res.status(400).json({ error: 'Drug text is required' });
  }

  const sql = 'UPDATE drugs SET drugs_text = ? WHERE id = ?';
  db.query(sql, [drugs_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update drug');
    res.json({ message: 'Drug updated successfully' });
  });
});

// Delete a drug
app.delete('/drugs/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM drugs WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete drug');
    res.json({ message: 'Drug deleted successfully' });
  });
});

// Fetch all dosages
app.get('/dosage', (req, res) => {
  const sql = 'SELECT * FROM dosage';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch dosage');
    console.log('Dosage fetched from database:', results);
    res.json(results);
  });
});

// Update a dosage
app.put('/dosage/:id', (req, res) => {
  const { id } = req.params;
  const { dosage_text } = req.body;

  if (!dosage_text) {
    return res.status(400).json({ error: 'Dosage text is required' });
  }

  const sql = 'UPDATE dosage SET dosage_text = ? WHERE id = ?';
  db.query(sql, [dosage_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update dosage');
    res.json({ message: 'Dosage updated successfully' });
  });
});

// Delete a dosage
app.delete('/dosage/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM dosage WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete dosage');
    res.json({ message: 'Dosage deleted successfully' });
  });
});

// Fetch all timings
app.get('/timing', (req, res) => {
  const sql = 'SELECT * FROM timing';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch timings');
    console.log('Timings fetched from database:', results);
    res.json(results);
  });
});

// Update a timing
app.put('/timing/:id', (req, res) => {
  const { id } = req.params;
  const { timing_text } = req.body;

  if (!timing_text) {
    return res.status(400).json({ error: 'Timing text is required' });
  }

  const sql = 'UPDATE timing SET timing_text = ? WHERE id = ?';
  db.query(sql, [timing_text, id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to update timing');
    res.json({ message: 'Timing updated successfully' });
  });
});

// Delete a timing
app.delete('/timing/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM timing WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return handleError(err, res, 'Failed to delete timing');
    res.json({ message: 'Timing deleted successfully' });
  });
});
app.get('/timing', (req, res) => {
  const sql = 'SELECT * FROM timing';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch timings' });
    res.json(results);
  });
});

// Update a timing
app.put('/timing/:id', (req, res) => {
  const { id } = req.params;
  const { timing_text } = req.body;

  if (!timing_text) {
    return res.status(400).json({ error: 'Timing text is required' });
  }

  const sql = 'UPDATE timing SET timing_text = ? WHERE id = ?';
  db.query(sql, [timing_text, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to update timing' });
    res.json({ message: 'Timing updated successfully' });
  });
});

// Delete a timing
app.delete('/timing/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM timing WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to delete timing' });
    res.json({ message: 'Timing deleted successfully' });
  });
});


// Get all durations
app.get('/duration', (req, res) => {
  const sql = 'SELECT * FROM duration';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch durations' });
    res.json(results);
  });
});

// Add a new duration
app.post('/duration', (req, res) => {
  const { duration_text } = req.body;

  if (!duration_text) {
    return res.status(400).json({ error: 'Duration text is required' });
  }

  const sql = 'INSERT INTO duration (duration_text) VALUES (?)';
  db.query(sql, [duration_text], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to add duration' });
    res.json({ message: 'Duration added successfully', id: results.insertId });
  });
});

// Update an existing duration
app.put('/duration/:id', (req, res) => {
  const { id } = req.params;
  const { duration_text } = req.body;

  if (!duration_text) {
    return res.status(400).json({ error: 'Duration text is required' });
  }

  const sql = 'UPDATE duration SET duration_text = ? WHERE id = ?';
  db.query(sql, [duration_text, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to update duration' });
    res.json({ message: 'Duration updated successfully' });
  });
});

// Delete a duration
app.delete('/duration/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM duration WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to delete duration' });
    res.json({ message: 'Duration deleted successfully' });
  });
});

// Get all advice given entries
app.get('/advicegiven', (req, res) => {
  const sql = 'SELECT * FROM advicegiven';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch advice given' });
    res.json(results);
  });
});

// Add a new advice entry
app.post('/advicegiven', (req, res) => {
  const { advicegiven_text } = req.body;

  if (!advicegiven_text) {
    return res.status(400).json({ error: 'Advice text is required' });
  }

  const sql = 'INSERT INTO advicegiven (advicegiven_text) VALUES (?)';
  db.query(sql, [advicegiven_text], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to add advice' });
    res.json({ message: 'Advice added successfully', id: results.insertId });
  });
});

// Update an existing advice entry
app.put('/advicegiven/:id', (req, res) => {
  const { id } = req.params;
  const { advicegiven_text } = req.body;

  if (!advicegiven_text) {
    return res.status(400).json({ error: 'Advice text is required' });
  }

  const sql = 'UPDATE advicegiven SET advicegiven_text = ? WHERE id = ?';
  db.query(sql, [advicegiven_text, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to update advice' });
    res.json({ message: 'Advice updated successfully' });
  });
});

// Delete an advice entry
app.delete('/advicegiven/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM advicegiven WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to delete advice' });
    res.json({ message: 'Advice deleted successfully' });
  });
});
// Get all vaccine entries
app.get('/vaccine', (req, res) => {
  const sql = 'SELECT * FROM vaccine';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch vaccines' });
    res.json(results);
  });
});

// Add a new vaccine entry
app.post('/vaccine', (req, res) => {
  const { vaccine_text } = req.body;

  if (!vaccine_text) {
    return res.status(400).json({ error: 'Vaccine text is required' });
  }

  const sql = 'INSERT INTO vaccine (vaccine_text) VALUES (?)';
  db.query(sql, [vaccine_text], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to add vaccine' });
    res.json({ message: 'Vaccine added successfully', id: results.insertId });
  });
});

// Update an existing vaccine entry
app.put('/vaccine/:id', (req, res) => {
  const { id } = req.params;
  const { vaccine_text } = req.body;

  if (!vaccine_text) {
    return res.status(400).json({ error: 'Vaccine text is required' });
  }

  const sql = 'UPDATE vaccine SET vaccine_text = ? WHERE id = ?';
  db.query(sql, [vaccine_text, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to update vaccine' });
    res.json({ message: 'Vaccine updated successfully' });
  });
});


app.post("/Createuser", (req, res) => {
  const UserName = req.body.UserName;
  const password = req.body.password;
  const roll = req.body.roll;
  const location = req.body.Location || req.body.location;
  const Phone_Number = req.body.Phone_Number
  console.log("all data", req.body)
  if (!UserName || !password || !roll || !location) {
    return res.status(400).json({
      error: `Missing required field: ${!UserName ? "UserName" :
        !password ? "password" :
          !roll ? "roll" : "location"
        }`
    });
  }

  const checkUsernameSql = "SELECT * FROM users_database WHERE UserName = ?";
  db.query(checkUsernameSql, [UserName], (err, userResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (userResults.length > 0) {
      return res.status(400).json({ error: "This username is already taken. Choose a different username." });
    }

    const insertSql = "INSERT INTO users_database(UserName, Password, roll, Location,Phone_Number) VALUES (?, ?, ?, ?,?)";
    db.query(insertSql, [UserName, password, roll, location, Phone_Number], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      console.log("User added successfully");
      return res.status(201).json({ status: "User added successfully" }); // Change to 201
    });
  });
});




// Delete a vaccine entry
app.delete('/vaccine/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM vaccine WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to delete vaccine' });
    res.json({ message: 'Vaccine deleted successfully' });
  });
});

app.get('/services', (req, res) => {
  const sql = 'SELECT * FROM services';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching services:', err);
      return res.status(500).json({ message: 'Failed to fetch services', error: err.message });
    }
    res.json(results);
  });
});

// POST a new service
app.post('/services', (req, res) => {
  const { service_name } = req.body;

  if (!service_name || service_name.trim() === '') {
    console.error('Invalid service_name:', service_name);
    return res.status(400).json({ message: 'Service name is required and cannot be empty' });
  }

  const sql = 'INSERT INTO services (service_name) VALUES (?)';
  db.query(sql, [service_name], (err, result) => {
    if (err) {
      console.error('Error adding service:', err);
      return res.status(500).json({ message: 'Failed to add service', error: err.message });
    }
    console.log('Service added:', { insertId: result.insertId });
    res.status(201).json({ message: 'Service added successfully', id: result.insertId });
  });
});

// PUT (update) a service
app.put('/services/:id', (req, res) => {
  const { id } = req.params;
  const { service_name } = req.body;

  if (!service_name || service_name.trim() === '') {
    console.error('Invalid service_name:', service_name);
    return res.status(400).json({ message: 'Service name is required and cannot be empty' });
  }

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Service ID must be a valid number' });
  }

  const sql = 'UPDATE services SET service_name = ? WHERE id = ?';
  db.query(sql, [service_name, idNumber], (err, result) => {
    if (err) {
      console.error('Error updating service:', err);
      return res.status(500).json({ message: 'Failed to update service', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Service not found:', idNumber);
      return res.status(404).json({ message: 'Service not found' });
    }
    console.log('Service updated:', { id: idNumber });
    res.json({ message: 'Service updated successfully' });
  });
});

// DELETE a service
app.delete('/services/:id', (req, res) => {
  const { id } = req.params;

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Service ID must be a valid number' });
  }

  const sql = 'DELETE FROM services WHERE id = ?';
  db.query(sql, [idNumber], (err, result) => {
    if (err) {
      console.error('Error deleting service:', err);
      return res.status(500).json({ message: 'Failed to delete service', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Service not found:', idNumber);
      return res.status(404).json({ message: 'Service not found' });
    }
    console.log('Service deleted:', { id: idNumber });
    res.json({ message: 'Service deleted successfully' });
  });
});


app.get('/roa', (req, res) => {
  const sql = 'SELECT * FROM roa';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching ROA entries:', err);
      return res.status(500).json({ message: 'Failed to fetch ROA entries', error: err.message });
    }
    res.json(results);
  });
});

// POST a new ROA entry
app.post('/roa', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    console.error('Invalid name:', name);
    return res.status(400).json({ message: 'Name is required and cannot be empty' });
  }

  const sql = 'INSERT INTO roa (name) VALUES (?)';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error adding ROA entry:', err);
      return res.status(500).json({ message: 'Failed to add ROA entry', error: err.message });
    }
    console.log('ROA entry added:', { insertId: result.insertId });
    res.status(201).json({ message: 'ROA entry added successfully', id: result.insertId });
  });
});

// PUT (update) a ROA entry
app.put('/roa/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    console.error('Invalid name:', name);
    return res.status(400).json({ message: 'Name is required and cannot be empty' });
  }

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'ROA ID must be a valid number' });
  }

  const sql = 'UPDATE roa SET name = ? WHERE id = ?';
  db.query(sql, [name, idNumber], (err, result) => {
    if (err) {
      console.error('Error updating ROA entry:', err);
      return res.status(500).json({ message: 'Failed to update ROA entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('ROA entry not found:', idNumber);
      return res.status(404).json({ message: 'ROA entry not found' });
    }
    console.log('ROA entry updated:', { id: idNumber });
    res.json({ message: 'ROA entry updated successfully' });
  });
});

// DELETE a ROA entry
app.delete('/roa/:id', (req, res) => {
  const { id } = req.params;

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'ROA ID must be a valid number' });
  }

  const sql = 'DELETE FROM roa WHERE id = ?';
  db.query(sql, [idNumber], (err, result) => {
    if (err) {
      console.error('Error deleting ROA entry:', err);
      return res.status(500).json({ message: 'Failed to delete ROA entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('ROA entry not found:', idNumber);
      return res.status(404).json({ message: 'ROA entry not found' });
    }
    console.log('ROA entry deleted:', { id: idNumber });
    res.json({ message: 'ROA entry deleted successfully' });
  });
});


app.get('/locationsuggestion', (req, res) => {
  console.log('Received request for /locationsuggestion at:', new Date().toISOString());
  const { search } = req.query;
  let sql = 'SELECT * FROM locations';
  let params = [];

  if (search) {
    sql += ' WHERE location_name LIKE ?';
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching location suggestions:', err);
      return res.status(500).json({ message: 'Failed to fetch location suggestions', error: err.message });
    }
    console.log('Fetched locations:', results);
    res.json(results);
  });
});
///doctor

app.get('/doctors_names', (req, res) => {
  const sql = 'SELECT * FROM doctors_name';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching doctor entries:', err);
      return res.status(500).json({ message: 'Failed to fetch doctor entries', error: err.message });
    }
    res.json(results);
  });
});

// POST a new doctor entry
app.post('/doctors_names', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    console.error('Invalid name:', name);
    return res.status(400).json({ message: 'Name is required and cannot be empty' });
  }

  const sql = 'INSERT INTO doctors_name (name) VALUES (?)';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error adding doctor entry:', err);
      return res.status(500).json({ message: 'Failed to add doctor entry', error: err.message });
    }
    console.log('Doctor entry added:', { insertId: result.insertId });
    res.status(201).json({ message: 'Doctor entry added successfully', id: result.insertId });
  });
});

// PUT (update) a doctor entry
app.put('/doctors_names/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    console.error('Invalid name:', name);
    return res.status(400).json({ message: 'Name is required and cannot be empty' });
  }

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Doctor ID must be a valid number' });
  }

  const sql = 'UPDATE doctors_name SET name = ? WHERE id = ?';
  db.query(sql, [name, idNumber], (err, result) => {
    if (err) {
      console.error('Error updating doctor entry:', err);
      return res.status(500).json({ message: 'Failed to update doctor entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Doctor entry not found:', idNumber);
      return res.status(404).json({ message: 'Doctor entry not found' });
    }
    console.log('Doctor entry updated:', { id: idNumber });
    res.json({ message: 'Doctor entry updated successfully' });
  });
});



app.get('/locations', (req, res) => {
  const sql = 'SELECT * FROM locations';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching locations:', err);
      return res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
    }
    res.json(results);
  });
});

// PUT (update) a location
app.put('/locations/:id', (req, res) => {
  const { id } = req.params;
  const { location_name } = req.body;

  if (!location_name || location_name.trim() === '') {
    console.error('Invalid location name:', location_name);
    return res.status(400).json({ message: 'Location name is required and cannot be empty' });
  }

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Location ID must be a valid number' });
  }

  const sql = 'UPDATE locations SET location_name = ? WHERE id = ?';
  db.query(sql, [location_name, idNumber], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Location name already exists' });
      }
      console.error('Error updating location:', err);
      return res.status(500).json({ message: 'Failed to update location', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Location not found:', idNumber);
      return res.status(404).json({ message: 'Location not found' });
    }
    console.log('Location updated:', { id: idNumber });
    res.json({ message: 'Location updated successfully' });
  });
});

// DELETE a location
app.delete('/locations/:id', (req, res) => {
  const { id } = req.params;

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Location ID must be a valid number' });
  }

  const sql = 'DELETE FROM locations WHERE id = ?';
  db.query(sql, [idNumber], (err, result) => {
    if (err) {
      console.error('Error deleting location:', err);
      return res.status(500).json({ message: 'Failed to delete location', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Location not found:', idNumber);
      return res.status(404).json({ message: 'Location not found' });
    }
    console.log('Location deleted:', { id: idNumber });
    res.json({ message: 'Location deleted successfully' });
  });
});


// DELETE a doctor entry
app.delete('/doctors_names/:id', (req, res) => {
  const { id } = req.params;

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Doctor ID must be a valid number' });
  }

  const sql = 'DELETE FROM doctors_name WHERE id = ?';
  db.query(sql, [idNumber], (err, result) => {
    if (err) {
      console.error('Error deleting doctor entry:', err);
      return res.status(500).json({ message: 'Failed to delete doctor entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Doctor entry not found:', idNumber);
      return res.status(404).json({ message: 'Doctor entry not found' });
    }
    console.log('Doctor entry deleted:', { id: idNumber });
    res.json({ message: 'Doctor entry deleted successfully' });
  });
});

//nurse

app.get('/nurses_name', (req, res) => {
  const sql = 'SELECT * FROM nurses_name';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching nurse entries:', err);
      return res.status(500).json({ message: 'Failed to fetch nurse entries', error: err.message });
    }
    res.json(results);
  });
});

// POST a new nurse entry
app.post('/nurses_name', (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    console.error('Invalid name:', name);
    return res.status(400).json({ message: 'Name is required and cannot be empty' });
  }

  const sql = 'INSERT INTO nurses_name (name) VALUES (?)';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error adding nurse entry:', err);
      return res.status(500).json({ message: 'Failed to add nurse entry', error: err.message });
    }
    console.log('Nurse entry added:', { insertId: result.insertId });
    res.status(201).json({ message: 'Nurse entry added successfully', id: result.insertId });
  });
});

// PUT (update) a nurse entry
app.put('/nurses_name/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    console.error('Invalid name:', name);
    return res.status(400).json({ message: 'Name is required and cannot be empty' });
  }

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Nurse ID must be a valid number' });
  }

  const sql = 'UPDATE nurses_name SET name = ? WHERE id = ?';
  db.query(sql, [name, idNumber], (err, result) => {
    if (err) {
      console.error('Error updating nurse entry:', err);
      return res.status(500).json({ message: 'Failed to update nurse entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Nurse entry not found:', idNumber);
      return res.status(404).json({ message: 'Nurse entry not found' });
    }
    console.log('Nurse entry updated:', { id: idNumber });
    res.json({ message: 'Nurse entry updated successfully' });
  });
});

// DELETE a nurse entry
app.delete('/nurses_name/:id', (req, res) => {
  const { id } = req.params;

  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    console.error('Invalid id:', id);
    return res.status(400).json({ message: 'Nurse ID must be a valid number' });
  }

  const sql = 'DELETE FROM nurses_name WHERE id = ?';
  db.query(sql, [idNumber], (err, result) => {
    if (err) {
      console.error('Error deleting nurse entry:', err);
      return res.status(500).json({ message: 'Failed to delete nurse entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Nurse entry not found:', idNumber);
      return res.status(404).json({ message: 'Nurse entry not found' });
    }
    console.log('Nurse entry deleted:', { id: idNumber });
    res.json({ message: 'Nurse entry deleted successfully' });
  });
});


app.get('/dental', (req, res) => {
  const sql = 'SELECT id, dental_text AS treatment_name FROM dental_values';
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to fetch dental values');
    console.log('Dental values fetched from database:', results);
    res.json(results);
  });
});

app.put('/dental/:id', (req, res) => {
  const { id } = req.params;
  const { treatment_name } = req.body; // Change to treatment_name

  if (!treatment_name || treatment_name.trim() === '') {
    console.error('Invalid treatment name:', treatment_name);
    return res.status(400).json({ message: 'Treatment name is required and cannot be empty' });
  }

  const sql = 'UPDATE dental_values SET dental_text = ? WHERE id = ?';
  db.query(sql, [treatment_name, id], (err, result) => {
    if (err) return handleError(err, res, 'Failed to update dental value');
    if (result.affectedRows === 0) {
      console.error('Dental value not found:', id);
      return res.status(404).json({ message: 'Dental value not found' });
    }
    console.log('Dental value updated:', { id, treatment_name });
    res.json({ message: 'Dental value updated successfully' });
  });
});

app.delete('/dental/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM dental_values WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return handleError(err, res, 'Failed to delete dental value');
    if (result.affectedRows === 0) {
      console.error('Dental value not found:', id);
      return res.status(404).json({ message: 'Dental value not found' });
    }
    console.log('Dental value deleted:', { id });
    res.json({ message: 'Dental value deleted successfully' });
  });
});

const uploadphoto = multer({ dest: 'uploads/' }); // Ensure this directory exists


// Ensure the userphotos directory exists
const photoDir = path.join(__dirname, 'userphotos');
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}
// Multer storage configuration
const sto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'temp_' + Date.now() + path.extname(file.originalname)); // Temporary filename
  },
});
app.get('/api/checkpatient/:phoneNumber', (req, res) => {
  const { phoneNumber } = req.params;

  db.query('SELECT COUNT(*) AS visitCount FROM patients WHERE phone_number = ?', [phoneNumber], (err, results) => {
    if (err) {
      console.error('Error checking patient:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const visitCount = results[0].visitCount;
    const exists = visitCount > 0;
    res.json({ exists, visitCount });
  });
});

app.get('/api/patient-details/:phoneNumber', (req, res) => {
  const { phoneNumber } = req.params;
  const query = `
    SELECT 
      p.full_name, 
      p.fathers_name, 
      p.age, 
      p.gender, 
      p.city, 
      p.phone_number, 
      p.patient_type, 
      p.services, 
      up.photo_path
    FROM patients p
    LEFT JOIN userphotos up ON p.phone_number = up.phone_number AND p.visted = up.visted
    WHERE p.phone_number = ?
    ORDER BY p.visted DESC
    LIMIT 1
  `;
  db.query(query, [phoneNumber], (err, results) => {
    if (err) {
      console.error('Error fetching patient details:', err);
      return res.status(500).json({ error: 'Failed to fetch patient details' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No patient found for this phone number' });
    }
    const patient = results[0];
    res.status(200).json({
      fullName: patient.full_name,
      fathersName: patient.fathers_name,
      age: patient.age,
      gender: patient.gender,
      city: patient.city,
      phoneNumber: patient.phone_number,
      patientType: patient.patient_type,
      services: patient.services ? patient.services.split(',') : [],
      photoPath: patient.photo_path,
    });
  });
});
// POST route to add a new patient
app.post('/api/patients', uploadphoto.single('photo'), (req, res) => {
  const {
    fullName,
    fathersName,
    age,
    gender,
    city,
    phoneNumber,
    appointmentDate,
    appointmentTime,
    services,
    receptionistName,
    patientType,
    franchiseLocation,
    id,
    roomNumber, // Add roomNumber
  } = req.body;

  const servicesStr = Array.isArray(services) ? services.join(',') : '';
  const patientTypeStr = patientType || '';

  // Validate franchiseLocation
  if (!franchiseLocation) {
    return res.status(400).json({ error: 'Franchise location is required' });
  }

  // Validate id
  if (!id) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  // Validate roomNumber for Inpatient
  if (patientTypeStr === 'Inpatient' && !roomNumber) {
    return res.status(400).json({ error: 'Room number is required for inpatients' });
  }

  db.query('SELECT COUNT(*) AS visitCount FROM patients WHERE phone_number = ?', [phoneNumber], (err, results) => {
    if (err) {
      console.error('Error counting visits:', err);
      return res.status(500).json({ error: 'Failed to count previous visits' });
    }

    let visitCount = results[0].visitCount + 1;

    db.query('SELECT photo_path FROM userphotos WHERE phone_number = ? ORDER BY visted DESC LIMIT 1', [phoneNumber], (err, photoResults) => {
      if (err) {
        console.error('Error checking photo:', err);
        return res.status(500).json({ error: 'Failed to check existing photo' });
      }

      let photoPath = null;

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        photoPath = `userphotos/${phoneNumber}_${visitCount}${ext}`;
        const newFilePath = path.join(photoDir, `${phoneNumber}_${visitCount}${ext}`);

        try {
          fs.renameSync(req.file.path, newFilePath);
        } catch (fileErr) {
          console.error('Error moving uploaded file:', fileErr);
          return res.status(500).json({ error: 'Failed to save uploaded photo' });
        }
      } else if (photoResults.length > 0) {
        photoPath = photoResults[0].photo_path;
      }

      const insertQuery = `
        INSERT INTO patients 
        (id, full_name, fathers_name, age, gender, city, phone_number, appointment_date, appointment_time, services, receptionistname, visted, status, patient_type, belongedlocation, room_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'receptioncompleted', ?, ?, ?)
      `;

      const values = [
        id,
        fullName,
        fathersName,
        age,
        gender,
        city,
        phoneNumber,
        appointmentDate,
        appointmentTime,
        servicesStr,
        receptionistName,
        visitCount,
        patientTypeStr,
        franchiseLocation,
        roomNumber || null, // Store roomNumber or null
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error inserting patient data:', err);
          return res.status(500).json({ error: 'Failed to save patient data' });
        }

        const photoInsertQuery = `
          INSERT INTO userphotos (phone_number, visted, photo_path)
          VALUES (?, ?, ?)
        `;

        db.query(photoInsertQuery, [phoneNumber, visitCount, photoPath], (err) => {
          if (err) {
            console.error('Error saving photo data:', err);
            return res.status(500).json({ error: 'Failed to save photo data' });
          }

          res.status(200).json({ message: 'Patient data and photo processed successfully' });
        });
      });
    });
  });
});
app.use(cors());
///nurse suggestion/////////

app.get('/adminlocations', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT location_name FROM locations where 1=1';
  const params = [];

  if (search && search.trim().length > 0) {
    query += ' AND LOWER(location_name) LIKE ?';
    params.push(`%${search.trim().toLowerCase()}%`);
  }

  query += ' ORDER BY location_name';

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching locations:', error);
      return res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
    console.log('Fetched locations:', results.length, 'records');
    res.json(results.map(row => row.location_name));
  });
});

app.get('/adminservices', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT DISTINCT service_name FROM services WHERE service_name IS NOT NULL';
  const params = [];

  if (search) {
    query += ' AND service_name LIKE ?';
    params.push(`${search}%`);
  }

  query += ' ORDER BY service_name';

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching services:', error);
      return res.status(500).send({ message: 'Error fetching services', error: error.message });
    }
    res.json(results.map(row => row.service_name));
  });
});

////////////for admin follow////////////
app.get('/api/getpatients', (req, res) => {
  const { PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation, Location, Services, NurseName, DoctorName,PatientType } = req.query;

  // Base query
  let query = `
    SELECT 
      id,
      full_name,
      fathers_name,
      age,
      gender,
      city,
      phone_number,
      appointment_date,
      appointment_time,
      services,
      queue,
      status,
      nursename,
      doctorname,
      MAX(visted) AS visted
    FROM patients
    WHERE 1=1 `;
    // AND status = 'billingcompleted'

  const params = [];
  console.log("location=>>>>>>>>>.",Location)
  // Add conditions based on provided query parameters
  if(PatientType){
    query += ' AND patient_type = ?';
    params.push(PatientType);
  }
  if (PhoneNumber) {
    query += ' AND phone_number = ?';
    params.push(PhoneNumber);
  }
  if (BusinessName) {
    query += ' AND full_name LIKE ?';
    params.push(`%${BusinessName}%`);
  }
  if (BusinessID) {
    query += ' AND id = ?';
    params.push(BusinessID);
  }
  if (fromDate) {
    query += ' AND appointment_date >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND appointment_date <= ?';
    params.push(toDate);
  }
  if (Services) {
    query += ' AND services LIKE ?';
    params.push(`%${Services}%`);
  }
  if (Location) {
    query += ' AND belongedlocation = ?';
    params.push(Location);
    console.log("fetch location",Location)
  }
  if (NurseName) {
    query += ' AND nursename = ?';
    params.push(NurseName);
  }
  if (DoctorName) {
    query += ' AND doctorname = ?';
    params.push(DoctorName);
  }

  query += ' GROUP BY phone_number ORDER BY queue DESC'; // Changed from 'id DESC' to 'queue DESC'

  // Log the constructed query and parameters for debugging
  console.log("Executing query:", query);
  console.log("Query parameters:", params);

  // Execute the query with parameters
  db.query(query, params, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send({ message: "Error fetching data", error: error.message });
    }
    console.log("Fetched patients with billingcompleted status:", results.length, "records");
    res.json(results);
  });
});

app.get('/api/get-billing-details', (req, res) => {
  const { phone_number, visted } = req.query;

  if (!phone_number || !visted) {
    return res.status(400).json({ message: 'phone_number and visted are required' });
  }

  // Updated patient query (without photo_url)
  const patientQuery = `
    SELECT full_name, phone_number
    FROM patients
    WHERE phone_number = ? AND visted = ?
  `;

  // Query to get photo path from userphotos
  const photoQuery = `
    SELECT photo_path
    FROM userphotos
    WHERE phone_number = ? AND visted = ?
    LIMIT 1
  `;

  const headerQuery = `
    SELECT id, user_id, user_name, phone_number, visit_number, nurse_name, total_price, billing_date
    FROM billing_headers
    WHERE phone_number = ? AND visit_number = ?
  `;

  const detailsQuery = `
    SELECT service_name, price
    FROM billing_details
    WHERE billing_id = ?
  `;

  db.query(patientQuery, [phone_number, visted], (err, patientResults) => {
    if (err) {
      console.error('Error fetching patient:', err);
      return res.status(500).json({ message: 'Error fetching patient data', error: err.message });
    }

    if (patientResults.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch photo
    db.query(photoQuery, [phone_number, visted], (err, photoResults) => {
      if (err) {
        console.error('Error fetching photo path:', err);
        return res.status(500).json({ message: 'Error fetching photo path', error: err.message });
      }

      const photo_path = photoResults[0]?.photo_path || null;

      db.query(headerQuery, [phone_number, visted], (err, headerResults) => {
        if (err) {
          console.error('Error fetching billing header:', err);
          return res.status(500).json({ message: 'Error fetching billing header', error: err.message });
        }

        if (headerResults.length === 0) {
          return res.status(404).json({ message: 'Billing header not found' });
        }

        const billingId = headerResults[0].id;

        db.query(detailsQuery, [billingId], (err, detailsResults) => {
          if (err) {
            console.error('Error fetching billing details:', err);
            return res.status(500).json({ message: 'Error fetching billing details', error: err.message });
          }

          // Attach photo_path to patient info
          const patientWithPhoto = {
            ...patientResults[0],
            photo_path
          };

          res.json({
            patient: patientWithPhoto,
            billing_header: headerResults[0],
            billing_details: detailsResults
          });
        });
      });
    });
  });
});


//////////////////////////////get the patinet from the table for patient follow up/////////////////////

app.get('/api/fetch-patients', (req, res) => {
  const { PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation } = req.query;

  // Base query
  let query = `
    SELECT 
      id,
      full_name,
      fathers_name,
      age,
      gender,
      city,
      phone_number,
      appointment_date,
      appointment_time,
      services,
      status,
      MAX(visted) AS visted
    FROM patients
    WHERE 1=1 AND (status="receptioncompleted" OR status="nursecompleted")`;

  const params = [];

  // Add conditions based on provided query parameters
  if (PhoneNumber) {
    query += ' AND phone_number = ?';
    params.push(PhoneNumber);
  }
  if (BusinessName) {
    query += ' AND full_name LIKE ?';
    params.push(`%${BusinessName}%`); // Allow partial matching for names
  }
  if (BusinessID) {
    query += ' AND id = ?';
    params.push(BusinessID);
  }
  if (fromDate) {
    query += ' AND appointment_date >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND appointment_date <= ?';
    params.push(toDate);
  }
  if (franchiselocation) {
    query += ' AND belongedlocation = ?';
    params.push(franchiselocation); // Filter by belonged_location
  }

  query += ' GROUP BY phone_number ORDER BY id DESC';

  // Execute the query with parameters
  db.query(query, params, (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      return res.status(500).send({ message: "Error fetching data", error: error.message });
    }
    res.json(results);
  });
});


app.get('/api/fetch-patients-in', (req, res) => {
  const { PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation, statusFilter, currentDate } = req.query;

  console.log('Received query params:', { PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation, statusFilter, currentDate });

  // Base query
  let query = `
    SELECT 
      id,
      full_name,
      fathers_name,
      age,
      gender,
      city,
      phone_number,
      appointment_date,
      appointment_time,
      services,
      status,
      queue,
      nursename,
      MAX(visted) AS visted
    FROM patients
    WHERE patient_type = 'Inpatient'`;
  const params = [];

  // Add status condition based on statusFilter
  if (statusFilter === 'completed' && currentDate) {
    query += ' AND LOWER(status) = ? AND DATE(entrydate) = ?';
    params.push('doctorcompleted', currentDate);
  } else {
    query += ' AND LOWER(status) IN (?, ?)';
    params.push('receptioncompleted', 'nursecompleted');
  }

  // Add conditions with LIKE for partial matching
  if (PhoneNumber) {
    query += ' AND phone_number LIKE ?';
    params.push(`%${PhoneNumber}%`);
  }
  if (BusinessName) {
    query += ' AND full_name LIKE ?';
    params.push(`%${BusinessName}%`);
  }
  if (BusinessID) {
    query += ' AND id LIKE ?';
    params.push(`%${BusinessID}%`);
  }
  if (fromDate) {
    query += ' AND appointment_date >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND appointment_date <= ?';
    params.push(toDate);
  }
  if (franchiselocation) {
    query += ' AND belongedlocation = ?';
    params.push(franchiselocation);
  }

  query += ' GROUP BY phone_number ORDER BY id DESC';

  console.log('Executing query:', query);
  console.log('Query parameters:', params);

  // Execute the query with parameters
  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send({ message: 'Error fetching data', error: error.message });
    }
    console.log('Query results:', results);
    res.json(results);
  });
});





app.get('/api/fetch-patients-out', (req, res) => {
  const {
    PhoneNumber,
    BusinessName,
    BusinessID,
    fromDate,
    toDate,
    franchiselocation,
    statusFilter,
    currentDate
  } = req.query;

  console.log('Received query params:', {
    PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation, statusFilter, currentDate
  });

  let query = `
    SELECT 
      p.id,
      p.full_name,
      p.fathers_name,
      p.age,
      p.gender,
      p.city,
      p.phone_number,
      p.appointment_date,
      p.appointment_time,
      p.services,
      p.queue,
      p.status,
      p.nursename,
      MAX(p.visted) AS visted
    FROM patients p
    WHERE p.patient_type = 'Outpatient'
  `;
  const params = [];

  // Filter for doctorcompleted
  if (statusFilter === 'completed' && currentDate) {
    query += ` AND LOWER(p.status) = ? AND DATE(p.entrydate) = ? `;
    params.push('doctorcompleted', currentDate);
  } else {
    // fallback: nursecompleted or receptioncompleted
    query += ` AND LOWER(p.status) IN (?, ?) `;
    params.push('receptioncompleted', 'nursecompleted');
  }

  // Optional filters
  if (PhoneNumber) {
    query += ` AND p.phone_number LIKE ? `;
    params.push(`%${PhoneNumber}%`);
  }
  if (BusinessName) {
    query += ` AND p.full_name LIKE ? `;
    params.push(`%${BusinessName}%`);
  }
  if (BusinessID) {
    query += ` AND p.id LIKE ? `;
    params.push(`%${BusinessID}%`);
  }
  if (fromDate) {
    query += ` AND p.appointment_date >= ? `;
    params.push(fromDate);
  }
  if (toDate) {
    query += ` AND p.appointment_date <= ? `;
    params.push(toDate);
  }
  if (franchiselocation) {
    query += ` AND p.belongedlocation = ? `;
    params.push(franchiselocation);
  }

  query += ` GROUP BY p.phone_number ORDER BY p.queue DESC`;

  console.log('Executing query:', query);
  console.log('Query parameters:', params);

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send({ message: 'Error fetching data', error: error.message });
    }
    res.json(results);
  });
});




app.post("/api/save-billing", (req, res) => {
  const billingData = req.body;
  console.log("Received billing data:", billingData);
  console.log("Phone Number:", billingData.phoneNumber);
  console.log("Visit Number:", billingData.visitNumber);
  console.log("Received Date:", billingData.date);
  console.log("all data",req.body)

  // Ensure date is in correct format (YYYY-MM-DD HH:MM:SS)
  let formattedDate = billingData.date;
  if (formattedDate.includes('T')) {
    formattedDate = new Date(formattedDate).toISOString().slice(0, 19).replace('T', ' ');
  }
  console.log("Formatted Date:", formattedDate);

  // Insert into billing_headers
  const insertHeaderSql = `
    INSERT INTO billing_headers (
    id,
      user_id, 
      user_name, 
      phone_number, 
      visit_number, 
      nurse_name, 
      total_price, 
      billing_date,
      payment_method,
      membership,
      reference,
      discount,
      membership_offer,
      membership_type,
      membership_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)
  `;

  const insertHeaderValues = [
    billingData.billId,
    billingData.userId,
    billingData.userName,
    billingData.phoneNumber,
    billingData.visitNumber,
    billingData.nurseName || '',
    parseFloat(billingData.totalPrice) || 0,
    formattedDate,
    billingData.paymentMode,
    billingData.membership_type,
    billingData.reference,
    billingData.overallDiscount,
    billingData.membershipOffer||'',
    billingData.membershipType||'',
    billingData.membershipPrice||''
  ];

  db.query(insertHeaderSql, insertHeaderValues, (err, result) => {
    if (err) {
      console.error("Error inserting billing header:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    console.log("Billing header inserted, now inserting details...");
    const    billingId = billingData.billId;

    // Insert billing details
    const insertDetailsSql = `
      INSERT INTO billing_details (
        billing_id, 
        service_name, 
        price,
        discount,
        detail
      ) VALUES (?,?, ?, ?,?)
    `;

    // Filter valid services
    const validServices = billingData.services.filter(service => {
      const isValid = service.service.trim() && !isNaN(parseFloat(service.price)) && parseFloat(service.price) > 0;
      if (!isValid) {
        console.warn("Skipping invalid service:", service);
      }
      return isValid;
    });

    if (validServices.length === 0) {
      // Update patient status even if no valid services
      const phoneNumber = billingData.phoneNumber;
      const visitNumber = billingData.visitNumber;

      const updateStatusSql = `
        UPDATE patients 
        SET status = 'billingcompleted' 
        WHERE phone_number = ? AND Visted = ?
      `;

      const updateStatusValues = [phoneNumber, visitNumber];

      db.query(updateStatusSql, updateStatusValues, (err, updateResult) => {
        if (err) {
          console.error("Error updating patient status:", err);
          return res.status(500).json({ message: "Error updating status", error: err });
        }

        console.log("Status updated...");
        res.status(200).json({
          message: "Billing information saved, status updated to 'billingcompleted'",
          success: true
        });
      });
      return;
    }

    let completedInserts = 0;

    validServices.forEach((service) => {
      const insertDetailsValues = [
        billingId,
        service.service.trim(),
        parseFloat(service.price),
        service.discount,
        service.details
      ];

      db.query(insertDetailsSql, insertDetailsValues, (err, detailResult) => {
        if (err) {
          console.error("Error inserting billing detail:", err);
          return res.status(500).json({ message: "Error inserting billing details", error: err });
        }

        completedInserts++;

        // When all details are inserted, update patient status
        if (completedInserts === validServices.length) {
          console.log("All billing details inserted, now updating status...");
          const phoneNumber = billingData.phoneNumber;
          const visitNumber = billingData.visitNumber;

          const updateStatusSql = `
            UPDATE patients 
            SET status = 'billingcompleted' 
            WHERE phone_number = ? AND Visted = ?
          `;

          const updateStatusValues = [phoneNumber, visitNumber];

          db.query(updateStatusSql, updateStatusValues, (err, updateResult) => {
            if (err) {
              console.error("Error updating patient status:", err);
              return res.status(500).json({ message: "Error updating status", error: err });
            }

            console.log("Status updated...");
            res.status(200).json({
              message: "Billing information saved, status updated to 'billingcompleted'",
              success: true
            });
          });
        }
      });
    });
  });
});

// Update patient's membership in the patients table
app.post('/api/update-membership', (req, res) => {
  const { id, phoneNumber, visited, membership } = req.body;

  if (!id || !phoneNumber || !visited || !membership) {
    return res.status(400).json({ success: false, message: 'id, phoneNumber, visited, and membership are required' });
  }

  const query = 'UPDATE patients SET membertype = ? WHERE id = ? AND phone_number = ? AND visted = ?';
  db.query(query, [membership, id, phoneNumber, visited], (error, results) => {
    if (error) {
      console.error('Error updating membership:', error);
      return res.status(500).json({ success: false, message: 'Failed to update membership' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Membership updated successfully' });
  });
});

app.get('/api/membership-types', (req, res) => {
  db.query('SELECT membership_type, price FROM Memberships', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get('/api/fetch-patients-receptionbilling', (req, res) => {
  const { PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation } = req.query;

  // Base query
  let query = `
    SELECT 
      id,
      full_name,
      fathers_name,
      age,
      doctorname,
      nursename,
      membertype,
      belongedlocation,
      gender,
      city,
      phone_number,
      appointment_date,
      appointment_time,
      services,
      status,
      MAX(visted) AS visted
    FROM patients
    WHERE 1=1 AND status = "doctorcompleted"`; // Always true to simplify adding conditions

  const params = [];

  // Add conditions based on provided query parameters
  if (PhoneNumber) {
    query += ' AND phone_number = ?';
    params.push(PhoneNumber);
  }
  if (BusinessName) {
    query += ' AND full_name LIKE ?';
    params.push(`%${BusinessName}%`); // Allow partial matching for names
  }
  if (BusinessID) {
    query += ' AND id = ?';
    params.push(BusinessID);
  }
  if (fromDate) {
    query += ' AND appointment_date >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND appointment_date <= ?';
    params.push(toDate);
  }
  if (franchiselocation) {
    query += ' AND belongedlocation =?';
    params.push(franchiselocation); // Filter by belonged_location
  }

  query += ' GROUP BY phone_number ORDER BY id DESC';

  // Execute the query with parameters
  db.query(query, params, (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      return res.status(500).send({ message: "Error fetching data", error: error.message });
    }
    res.json(results);
  });
});;

////////////fetch patients for tereamtnpage//////////////////
app.get('/user/:phoneId', async (req, res) => {
  const phoneId = req.params.phoneId;

  try {
    // Query the database for user data
    const result = await pool.query(
      'SELECT name, phone FROM users WHERE id = $1',
      [phoneId]
    );

    if (result.rows.length > 0) {
      const userData = result.rows[0];
      res.json({
        success: true,
        data: userData,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
});
//////////////////////////get the data from the admin form ////////////

app.get('/api/patientCounts', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN patient_type = 'inpatient' THEN 1 ELSE 0 END) as inpatient_count,
      SUM(CASE WHEN patient_type = 'outpatient' THEN 1 ELSE 0 END) as outpatient_count
    FROM patients
    WHERE 
  status = 'nursecompleted';
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error retrieving data');
    } else {
      res.status(200).json(results[0]); // Send counts as JSON
    }
  });
});

/////////////////fetch the onexamination form the database////////////
app.get('/api/onexamination', (req, res) => {
  // const id = req.params.id;
  const query = 'SELECT onexam_text FROM onexam';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error retrieving data');
    } else {
      const onexamination = results.map((row) => row.onexam_text); // Correct field name here
      res.status(200).json(onexamination); // Send data as JSON
    }
  });
});
//photo

app.use('/userphotos', express.static(path.join(__dirname, 'userphotos')));

// API to fetch image path
app.get('/api/user-photo', (req, res) => {
  const { phoneNumber, visited } = req.query;

  if (!phoneNumber || !visited) {
    return res.status(400).json({ error: 'Missing phoneNumber or visited parameter' });
  }

  const query = 'SELECT photo_path FROM userphotos WHERE phone_number = ? AND visted = ? LIMIT 1';

  db.query(query, [phoneNumber, visited], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageUrl = `https://amrithaahospitals.visualplanetserver.in/${results[0].photo_path}`;
    res.json({ imageUrl });
  });
});
//onsystem
app.get('/api/onsystem', (req, res) => {
  db.query('SELECT sysexam_text FROM sysexam', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send("Error retriving data");
    } else {
      const onsystem = result.map((row) => row.sysexam_text);
      res.status(200).json(onsystem)
    }
  })
})

// //test to take
app.get('/api/tests', (req, res) => {
  db.query('SELECT tests_text FROM tests', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json("Error retriving data", err);
    } else {
      const test = result.map((row) => row.tests_text);
      res.status(200).json(test)
    }
  })
})

//dosage list in the input field///
// Reusable function to handle suggestions
function createSuggestionRoute(path, tableName, columnName) {
  app.get(path, (req, res) => {
    const searchTerm = req.query.term;

    if (!searchTerm) {
      return res.json([]);
    }

    // Query to fetch matching text from the database
    db.query(
      `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} LIKE ? LIMIT 5`,
      [`%${searchTerm}%`],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json(results.map(row => row[columnName]));
      }
    );
  });
}

// Creating suggestion routes with the reusable function
createSuggestionRoute('/api/dosage-suggestions', 'dosage', 'dosage_text');
createSuggestionRoute('/api/dental-suggestions', 'dental', 'dental_text');
createSuggestionRoute('/api/roa-suggestions', 'roa', 'name')
createSuggestionRoute('/api/drugs-suggestions', 'drugs', 'drugs_text');
createSuggestionRoute('/api/duration-suggestions', 'duration', 'duration_text');
createSuggestionRoute('/api/timing-suggestions', 'timing', 'timing_text');
createSuggestionRoute('/api/treatmentgiven-suggestions', 'treatmentgiven', 'treatmentgiven_text');
createSuggestionRoute('/api/vaccine-suggestions', 'vaccine', 'vaccine_text');
createSuggestionRoute('/api/vitals-suggestions', 'vitals', 'vitals_text');
createSuggestionRoute('/api/advicegiven-suggestions', 'advicegiven', 'advicegiven_text');
////////save-data////
app.use(express.json()); // To parse JSON payloads


// const uploadDir = path.join(__dirname, 'usersfiles');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// Multer Storage Configuration (Renamed to `storagefile`)
const storagefile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const phoneNumber = req.body.businessName; // Extract from formData
    const visited = req.body.visited;
    const fileExt = path.extname(file.originalname);
    const filename = `file_${phoneNumber}_${visited}_${Date.now()}${fileExt}`;
    cb(null, filename);
  }
});
// server.js or routes file
// Endpoint to fetch dental value suggestions
app.get('/api/dental-suggestions', (req, res) => {
  const { query } = req.query;

  // Validate query parameter
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Query parameter with at least 2 characters is required' });
  }

  // Validate query characters (alphanumeric and spaces only)
  if (!/^[a-zA-Z0-9\s]*$/.test(query)) {
    return res.status(400).json({ error: 'Invalid query characters' });
  }

  // Prepare search term
  const searchTerm = `%${query.trim()}%`;

  // Query to fetch suggestions from dental_values table
  const sql = 'SELECT DISTINCT dental_text FROM dental_values WHERE dental_text LIKE ' % te % ' ORDER BY dental_text LIMIT 10;'

  db.query(sql, [searchTerm], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Extract values from results
    const suggestions = results.map((row) => row.value);
    res.json(suggestions);
  });
});
const uploadfiles = multer({ storage: storagefile });

app.get('/api/nurse-suggestions', (req, res) => {
  const { franchiselocation } = req.query;

  if (!franchiselocation) {
    return res.status(400).json({ error: 'franchiselocation parameter is required' });
  }

  const sql = 'SELECT name FROM nurses_name WHERE location = ?';

  db.query(sql, [franchiselocation], (err, results) => {
    if (err) {
      console.error('Error fetching nurse suggestions:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    try {
      const suggestions = results.map(row => row.name);
      res.json(suggestions);
    } catch (parseError) {
      console.error('Error parsing nurse suggestions:', parseError);
      res.status(500).json({ error: 'Data processing error' });
    }
  });
});

app.get('/api/doctor-suggestions', (req, res) => {
  const { franchiselocation } = req.query;
  let sql = 'SELECT name FROM doctors_name WHERE location = ?';
  let params = [franchiselocation];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching doctor suggestions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const suggestions = results.map(row => row.name);
    res.json(suggestions);
  });
});

const insertData = async (tableName, columns, dataArray) => {
  console.log(`Inserting into ${tableName}:`, { dataArray, isArray: Array.isArray(dataArray) });
  if (!dataArray || !Array.isArray(dataArray)) {
    console.warn(`Skipping insert into ${tableName}: dataArray is not iterable`, dataArray);
    return;
  }
  if (dataArray.length === 0) {
    console.log(`No data to insert into ${tableName}`);
    return;
  }
  const sql = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${columns.map(() => '?').join(', ')});
  `;
  for (const item of dataArray) {
    try {
      const [result] = await db.query(sql, item);
      console.log(`Inserted into ${tableName}:`, item);
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error, { item });
    }
  }
};

// Update the /save-data endpoint to ensure all data arrays are valid
app.post('/save-data', uploadfiles.array('uploadfiles', 10), (req, res) => {
  const formData = req.body;
  console.log('Received formData:', formData);
  console.log("vitals: ", formData.vitals)
  // vitals 
  const { Name, Phone_number, Visit } = formData.vitals
  if (!Name) {
    formData.vitals.Name = req.body.name
    // return res.status(400).json({ message: "Missing required fields Name" });
    // console.log("appen dta-->",formData.vitals)
  }
  if (!Phone_number) {
    formData.vitals.Phone_number = req.body.businessName
    formData.vitals.Visit = req.body.visited
    // return res.status(400).json({ message: "Missing required fields Phonenumber" });
  }
  if (formData.vitals == null) {
    return res.status(400).json({ message: "Missing required fields vitals" });
  }
  // First, check if record exists
  const checkQuery = "SELECT * FROM vitals WHERE Name = ? AND Phone_number = ? AND Visit = ?";
  db.query(checkQuery, [Name, Phone_number, Visit], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });

    const columns = Object.keys(formData.vitals);
    const values = Object.values(formData.vitals);
    console.log("columsn->", columns)
    console.log("values->", values)
    if (results.length > 0) {
      // UPDATE 
      const setClause = columns.map(col => `\`${col}\` = ?`).join(", ");
      console.log("setClause ", setClause)
      const updateQuery = `UPDATE vitals SET ${setClause} WHERE Name = ? AND Phone_number = ? AND Visit = ?`;
      // , Name, Phone_number, Visit
      db.query(updateQuery, [...values, Name, Phone_number, Visit], (err) => {
        if (err) return res.status(400).json({ error: err });
        console.log({ message: "Vital updated successfully" });
      });

    } else {
      // INSERT
      // "Name", "Phone_number", "Visit",
      const allColumns = [...columns];
      const placeholders = allColumns.map(() => "?").join(", ");
      const insertQuery = `INSERT INTO vitals (${allColumns.map(col => `\`${col}\``).join(", ")}) VALUES (${placeholders})`;

      const insertValues = [...values];
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        console.log({ message: "Vital inserted successfully" });
      });
    }
  });
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const patientSql = `
    INSERT INTO general_patient (
      Name, Phone_Number, Visted, 
      Major_Complaints, FollowUpDate, Advice_Given, LocalExamination, Dignosis, doctor_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const patientValues = [
    formData.name,
    formData.businessName,
    formData.visited || 0,
    formData.majorComplaints || null,
    formData.followupdate || null,
    formData.advicegiven || null,
    formData.local || null,
    formData.dignosis || null,
    formData.doctorName || null,
  ];

  db.query(patientSql, patientValues, (err, result) => {
    if (err) {
      console.error('Error inserting general patient data:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    // Update patient status to doctorcompleted
    const updateStatusSql = `
      UPDATE patients
      SET status = ?, doctorname = ?,entrydate=?
      WHERE full_name = ? AND phone_number = ? AND visted = ?;
    `;
    const updateStatusValues = [
      'doctorcompleted',
      formData.doctorName || null,
      getCurrentDate(),
      formData.name,
      formData.businessName,
      formData.visited || 0,
    ];

    db.query(updateStatusSql, updateStatusValues, (err, result) => {
      if (err) {
        console.error('Error updating patient status to doctorcompleted:', err);
        return res.status(500).json({ message: 'Database error updating status', error: err });
      }
      console.log('Patient status updated to doctorcompleted:', result);
    });

    const insertData = (tableName, columns, dataArray) => {
      if (dataArray && dataArray.length > 0) {
        const sql = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${columns.map(() => '?').join(', ')});
        `;
        dataArray.forEach((item) => {
          db.query(sql, item, (err, result) => {
            if (err) {
              console.error(`Error inserting into ${tableName}:`, err);
            } else {
              console.log(`Inserted into ${tableName}:`, item);
            }
          });
        });
      }
    };

    const onExaminationData = (Array.isArray(formData.selectonexamination) ? formData.selectonexamination : [])
      .filter((key) => typeof key === 'string' && key.trim() !== '' && key !== '0')
      .map((key) => [
        formData.name,
        formData.businessName,
        formData.visited || 0,
        key,
      ]);

    console.log('onExaminationData:', onExaminationData);

    insertData('on_examination_form', ['Name', 'Phone_Number', 'Visited', 'onexam_form'], onExaminationData);

    const treatmentData = (formData.treatment || []).map((treatment) => [
      formData.name,
      formData.businessName,
      formData.visited || 0,
      treatment.treatmentdosage || null,
      treatment.treatmentgivenname || null,
      treatment.treatmentrout || null,
    ]);
    insertData('treatment_given_form', ['Name', 'Phone_Number', 'Visited', 'Dosage', 'Route_Of_Administration', 'treatmentgivenname'], treatmentData);

    const prescriptionData = (formData.prescription || []).map((prescription) => [
      formData.name,
      formData.businessName,
      formData.visited || 0,
      prescription.medicine || null,
      prescription.dosage || null,
      prescription.timing || null,
      prescription.duration || null,
    ]);
    insertData('prescription_form', ['Name', 'Phone_Number', 'Visited', 'Medicine', 'Dosage', 'Timing', 'Duration'], prescriptionData);

    insertData('famil_history', ['Name', 'Phone_Number', 'Visted', 'Family_History'], (formData.familyHistory || []).map((item) => [
      formData.name,
      formData.businessName,
      formData.visited || 0,
      item,
    ]));

    insertData('birth_history', ['Name', 'Phone_Number', 'Visted', 'Birth_History'], (formData.birthHistory || []).map((item) => [
      formData.name,
      formData.businessName,
      formData.visited || 0,
      item,
    ]));

    insertData('surgical_history', ['Name', 'Phone_Number', 'Visted', 'Surgical_History'], (formData.surgicalHistory || []).map((item) => [
      formData.name,
      formData.businessName,
      formData.visited || 0,
      item,
    ]));

    insertData('anyotherhistory', ['Name', 'Phone_Number', 'Visted', 'Other_History'], (formData.otherHistory || []).map((item) => [
      formData.name,
      formData.businessName,
      formData.visited || 0,
      item,
    ]));

    const TestData = (formData.selectavailableTests || [])
      .filter(key => typeof key === 'string' && key.trim() !== '')
      .map((key) => [
        formData.name,
        formData.businessName,
        formData.visited || 0,
        key,
      ]);
    insertData('test_to_take', ['Name', 'Phone_Number', 'Visited', 'TestToTake'], TestData);


    const SystematicExamData = (formData.selectsystematic || [])
      .filter(key => typeof key === 'string' && key.trim() !== '')
      .map((key) => [
        formData.name,
        formData.businessName,
        formData.visited || 0,
        key,
      ]);
    insertData('systemic_examination_form', ['Name', 'Phone_Number', 'Visited', 'sysexam_form'], SystematicExamData);

    if (req.files.length > 0) {
      const fileInsertSql = `
        INSERT INTO uploaded_files (Phone_Number, Visted, FilePath)
        VALUES (?, ?, ?);
      `;
      req.files.forEach((file) => {
        const filePath = `/usersfiles/${file.filename}`;
        db.query(fileInsertSql, [formData.businessName, formData.visited, filePath], (err, result) => {
          if (err) {
            console.error('Error inserting file path:', err);
          }
        });
      });
    }

    // Original update doctor name query (now combined with status update)
    res.status(200).json({ message: 'Data stored successfully' });
  });
});

app.post(
  "/save-data-update",
  uploadfiles.array("uploadfiles", 10),
  async (req, res) => {
    const formData = req.body;
    console.log("Received formData:", formData);

    // 1. Validate required fields
    const requiredFields = ["name", "businessName", "visited"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate data types
    if (isNaN(parseInt(formData.visited))) {
      return res.status(400).json({
        success: false,
        message: "Visited must be a valid number",
      });
    }

    // Get a database connection
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection error",
          error: err.message,
        });
      }

      try {
        // Start transaction
        await queryAsync("START TRANSACTION", [], connection);

        // 2. Insert/Update general patient data
        const patientSql = `
          INSERT INTO general_patient (
            Name, Phone_Number, Visted, Major_Complaints, 
            FollowUpDate, Advice_Given, LocalExamination, 
            Dignosis, doctor_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            Major_Complaints = VALUES(Major_Complaints),
            FollowUpDate = VALUES(FollowUpDate),
            Advice_Given = VALUES(Advice_Given),
            LocalExamination = VALUES(LocalExamination),
            Dignosis = VALUES(Dignosis),
            doctor_name = VALUES(doctor_name);
        `;
        const patientValues = [
          formData.name,
          formData.businessName,
          formData.visited || 0,
          formData.majorComplaints || null,
          formData.followupdate || null,
          formData.advicegiven || null,
          formData.local || null,
          formData.dignosis || null,
          formData.doctorName || null,
        ];
        await queryAsync(patientSql, patientValues, connection);

        // 3. Update patient status
        const updateStatusSql = `
          UPDATE patients
          SET status = ?, doctorname = ?
          WHERE full_name = ? AND phone_number = ? AND vKids = ?;
        `;
        await queryAsync(
          updateStatusSql,
          [
            "doctorcompleted",
            formData.doctorName || null,
            formData.name,
            formData.businessName,
            formData.visited || 0,
          ],
          connection
        );

        // 4. Helper function for batch inserts
        const batchInsert = async (tableName, columns, dataArray) => {
          if (!Array.isArray(dataArray) || dataArray.length === 0) {
            console.log(`No data to insert into ${tableName}`);
            return;
          }

          // Delete existing records
          const deleteSql = `
            DELETE FROM ${connection.escapeId(tableName)} 
            WHERE Name = ? AND Phone_Number = ? AND Visited = ?;
          `;
          await queryAsync(
            deleteSql,
            [formData.name, formData.businessName, formData.visited || 0],
            connection
          );

          // Insert new records
          const insertSql = `
            INSERT INTO ${connection.escapeId(tableName)} 
            (${columns.map((col) => connection.escapeId(col)).join(", ")})
            VALUES ?;
          `;
          const values = dataArray.map((item) =>
            columns.map((col) => item[columns.indexOf(col)] || null)
          );
          await queryAsync(insertSql, [values], connection);
        };

        // 5. Process examination data
        const onExaminationData = (formData.selectonexamination || []).map(
          (key) => [
            formData.name,
            formData.businessName,
            formData.visited || 0,
            key,
          ]
        );
        await batchInsert(
          "on_examination_form",
          ["Name", "Phone_Number", "Visited", "onexam_form"],
          onExaminationData
        );

        // 6. Process systematic examination data
        const systematicExamData = (formData.selectsystematic || []).map(
          (key) => [
            formData.name,
            formData.businessName,
            formData.visited || 0,
            key,
          ]
        );
        await batchInsert(
          "systemic_examination_form",
          ["Name", "Phone_Number", "Visited", "sysexam_form"],
          systematicExamData
        );

        // 7. Process test data
        const testData = (formData.selectavailableTests || []).map((key) => [
          formData.name,
          formData.businessName,
          formData.visited || 0,
          key,
        ]);
        await batchInsert(
          "test_to_take",
          ["Name", "Phone_Number", "Visited", "TestToTake"],
          testData
        );

        // 8. Process treatment data
        const treatmentData = (formData.treatment || []).map((treatment) => [
          formData.name,
          formData.businessName,
          formData.visited || 0,
          treatment.treatmentdosage || null,
          treatment.treatmentrout || null,
          treatment.treatmentgivenname || null,
        ]);
        await batchInsert(
          "treatment_given_form",
          [
            "Name",
            "Phone_Number",
            "Visited",
            "Dosage",
            "Route_Of_Administration",
            "treatmentgivenname",
          ],
          treatmentData
        );

        // 9. Process prescription data
        const prescriptionData = (formData.prescription || []).map(
          (prescription) => [
            formData.name,
            formData.businessName,
            formData.visited || 0,
            prescription.medicine || null,
            prescription.dosage || null,
            prescription.timing || null,
            prescription.duration || null,
          ]
        );
        await batchInsert(
          "prescription_form",
          [
            "Name",
            "Phone_Number",
            "Visited",
            "Medicine",
            "Dosage",
            "Timing",
            "Duration",
          ],
          prescriptionData
        );

        // 10. Process history data
        const processHistoryData = async (tableName, columnName, items) => {
          if (!Array.isArray(items) || items.length === 0) return;

          const historyData = items.map((item) => [
            formData.name,
            formData.businessName,
            formData.visited || 0,
            item,
          ]);
          await batchInsert(tableName, [
            "Name",
            "Phone_Number",
            "Visted",
            columnName,
          ], historyData);
        };

        await processHistoryData(
          "famil_history",
          "Family_History",
          formData.familyHistory || []
        );
        await processHistoryData(
          "birth_history",
          "Birth_History",
          formData.birthHistory || []
        );
        await processHistoryData(
          "surgical_history",
          "Surgical_History",
          formData.surgicalHistory | []
        );
        await processHistoryData(
          "anyotherhistory",
          "Other_History",
          formData.otherHistory || []
        );

        // 11. Process uploaded files
        if (req.files && req.files.length > 0) {
          const fileInsertSql = `
            INSERT INTO uploaded_files (Phone_Number, Visted, FilePath, File_Name)
            VALUES ?;
          `;
          const fileValues = req.files.map((file) => [
            formData.businessName,
            formData.visited || 0,
            `/usersfiles/${file.filename}`,
            file.originalname,
          ]);
          await queryAsync(fileInsertSql, [fileValues], connection);
        }

        // 12. Commit transaction
        await queryAsync("COMMIT", [], connection);
        connection.release();

        res.status(200).json({
          success: true,
          message: "Data stored successfully",
          affectedTables: [
            "general_patient",
            "patients",
            "on_examination_form",
            "systemic_examination_form",
            "test_to_take",
            "treatment_given_form",
            "prescription_form",
            "famil_history",
            "birth_history",
            "surgical_history",
            "anyotherhistory",
            ...(req.files?.length ? ["uploaded_files"] : []),
          ],
        });
      } catch (error) {
        // Rollback transaction on error
        await queryAsync("ROLLBACK", [], connection);
        connection.release();

        console.error("Transaction error:", {
          message: error.message,
          stack: error.stack,
          formData: {
            name: formData.name,
            businessName: formData.businessName,
            visited: formData.visited,
          },
        });

        res.status(500).json({
          success: false,
          message: "Database transaction failed",
          error: error.message,
          details: error.sqlMessage || "Unknown database error",
        });
      }
    });
  }
);




app.get('/api/fetch-patients-nurse', (req, res) => {
  const { PhoneNumber, BusinessName, BusinessID, fromDate, toDate, franchiselocation, completionStatus, currentDate } = req.query;

  // Base query
  let query = `
    SELECT 
      id,
      full_name,
      fathers_name,
      age,
      gender,
      city,
      phone_number,
      appointment_date,
      appointment_time,
      services,
      queue,
      status,
      nursename,
      MAX(visted) AS visted
    FROM patients
    WHERE 1=1`;

  const params = [];

  // Add status condition based on completionStatus
  if (completionStatus === 'completed') {
    query += ' AND LOWER(status) = ? AND entrydate = ? ';
    params.push('nursecompleted', currentDate);
  } else if (completionStatus === 'not_completed') {
    query += ' AND LOWER(status) = ?';
    params.push('receptioncompleted');
  }

  // Add conditions based on provided query parameters
  if (PhoneNumber) {
    query += ' AND phone_number LIKE ?';
    params.push(`%${PhoneNumber}%`);
  }
  if (BusinessName) {
    query += ' AND full_name LIKE ?';
    params.push(`%${BusinessName}%`);
  }
  if (BusinessID) {
    query += ' AND id LIKE ?';
    params.push(`%${BusinessID}%`);
  }
  if (fromDate) {
    query += ' AND appointment_date >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND appointment_date <= ?';
    params.push(toDate);
  }
  if (franchiselocation) {
    query += ' AND belongedlocation = ?';
    params.push(franchiselocation);
  }

  query += ' GROUP BY phone_number ORDER BY id DESC';

  // Log the query and parameters for debugging
  console.log('Executing Query:', query);
  console.log('Parameters:', params);

  // Execute the query with parameters
  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send({ message: 'Error fetching data', error: error.message });
    }
    console.log('Query Results:', results);
    res.json(results);
  });
});





app.post('/update-status', (req, res) => {
  const { name, businessName, visited, status } = req.body;
  const updateStatusSql = `
    UPDATE patients
    SET status = ?
    WHERE full_name = ? AND Phone_Number = ? AND Visted = ?;
  `;
  const updateStatusValues = [
    status,
    name,
    businessName,
    visited || 0,
  ];
  db.query(updateStatusSql, updateStatusValues, (err, result) => {
    if (err) {
      console.error('Error updating patient status:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ message: 'Status updated successfully' });
  });
});



app.post("/adddental/:Name/:Visit/:Phone_number", (req, res) => {
  const { Phone_number, Name, Visit } = req.params;

  // Parse the dental data from the request body
  let dentalData = {};
  try {
    dentalData = JSON.parse(req.body.dental || '{}');
  } catch (error) {
    console.error('Error parsing dental data:', error);
    return res.status(400).json({ message: 'Invalid dental data format', error: error.message });
  }

  // Define the FDI tooth numbers that correspond to the table columns
  const fdiColumns = [
    '11', '12', '13', '14', '15', '16', '17', '18',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '31', '32', '33', '34', '35', '36', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48'
  ];

  // Map dental data to table columns, defaulting to NULL for unspecified teeth
  const toothStatus = fdiColumns.map((col) => dentalData[col] || null);

  // Generate the column list for the SQL query
  const toothColumns = fdiColumns.map((col) => `\`${col}\``).join(', ');

  // Generate placeholders for Name, Phone_number, Visit, and all FDI columns
  const placeholders = Array(3 + fdiColumns.length).fill('?').join(', ');

  // Construct the SQL query
  const sql = `INSERT INTO dental_records (Name, Phone_number, Visit, ${toothColumns}) VALUES (${placeholders})`;

  // Combine values for the query
  const values = [Name, Phone_number, Visit, ...toothStatus];

  // Log for debugging
  console.log('SQL Query:', sql);
  console.log('Values:', values);
  console.log('Dental Data:', dentalData);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(400).json({ message: 'Failed to insert dental records', error: err.message });
    }
    console.log('Insert Result:', result);
    return res.json({ status: "success" });
  });
});


app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users_database";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.status(200).json(results);
  });
});



app.put("/update-user/:phone_number", (req, res) => {
  const phone_Number = req.params.phone_number;
  const { UserName, Name, Location, roll, Password } = req.body;

  const sql = "UPDATE users_database SET UserName=?, Location=?, roll=?, Password=? WHERE Phone_Number=?";
  db.query(sql, [UserName, Location, roll, Password, phone_Number], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.status(200).json({ message: "User updated successfully" });
  });
});

app.post("/save-data-nurse", (req, res) => {
  const formData = req.body;
  console.log("Received form data:", formData);

  // Ensure we're using the correct field names
  const phoneNumber = formData.Phone_number || formData.Phone_Number;
  const visited = formData.visited || 0;
  const nurseName = formData.nurseName || null;

  // Validate required fields
  if (!phoneNumber || !formData.name || !visited) {
    console.warn("Missing required fields:", { phoneNumber, name: formData.name, visited });
    return res.status(400).json({
      message: "Missing required fields: Phone_number, name, or visited"
    });
  }

  // Insert into general_patient table
  const insertSql = `INSERT INTO general_patient (Name, Phone_Number, visted, Major_Complaints) VALUES (?, ?, ?, ?)`;
  const insertValues = [
    formData.name,
    phoneNumber,
    visited,
    formData.majorComplaints || null,
  ];

  db.query(insertSql, insertValues, (err, result) => {
    if (err) {
      console.error("Error inserting data into general_patient:", err);
      return res.status(500).json({
        message: "Database error inserting general_patient data",
        error: err.message
      });
    }

    console.log("Inserted into general_patient:", result);

    // Update the patients table with nurse name, status, and entrydate
    const updateSql = `UPDATE patients 
                      SET nursename = ?, 
                          status = 'nursecompleted',
                          entrydate = CURDATE()
                      WHERE phone_number = ? 
                      AND visted = ?`;
    const updateValues = [nurseName, phoneNumber, visited];

    db.query(updateSql, updateValues, (err, updateResult) => {
      if (err) {
        console.error("Error updating patients table:", err);
        return res.status(500).json({
          message: "Database error updating patients table",
          error: err.message
        });
      }

      if (updateResult.affectedRows === 0) {
        console.warn("No rows updated in patients table", { phoneNumber, visited, nurseName });
        return res.status(404).json({
          message: "No matching patient found to update",
          details: `phone_number: ${phoneNumber}, Visited: ${visited}`
        });
      }

      console.log("Updated patients table:", updateResult);
      res.status(200).json({
        message: "Data saved successfully, status and entrydate updated",
        general_patient_id: result.insertId,
        updated_rows: updateResult.affectedRows
      });
    });
  });
});

app.get("/getservices", (req, res) => {
  const sql = "SELECT * FROM services";
  db.query(sql, (err, results) => {
    if (err) return handleError(err, res, 'Failed to get services');
    res.json(results.map((row) => row.service_name))
  })
})



// GET all membership entries
app.get('/memberships', (req, res) => {
  const sql = 'SELECT * FROM Memberships';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching membership entries:', err);
      return res.status(500).json({ message: 'Failed to fetch membership entries', error: err.message });
    }
    res.json(results);
  });
});

// POST a new membership entry
app.post('/memberships', (req, res) => {
  const { membership_type, price } = req.body;

  if (!membership_type || membership_type.trim() === '') {
    console.error('Invalid membership_type:', membership_type);
    return res.status(400).json({ message: 'Membership type is required and cannot be empty' });
  }

  if (price !== null && (isNaN(price) || price < 0)) {
    console.error('Invalid price:', price);
    return res.status(400).json({ message: 'Price must be a valid non-negative number or null' });
  }

  const sql = 'INSERT INTO Memberships (membership_type, price) VALUES (?, ?)';
  db.query(sql, [membership_type, price], (err, result) => {
    if (err) {
      console.error('Error adding membership entry:', err);
      return res.status(500).json({ message: 'Failed to add membership entry', error: err.message });
    }
    console.log('Membership entry added:', { membership_type });
    res.status(201).json({ message: 'Membership entry added successfully', membership_type });
  });
});

// PUT (update) a membership entry
app.put('/memberships/:membership_type', (req, res) => {
  const { membership_type: oldMembershipType } = req.params;
  const { membership_type, price } = req.body;

  if (!membership_type || membership_type.trim() === '') {
    console.error('Invalid membership_type:', membership_type);
    return res.status(400).json({ message: 'Membership type is required and cannot be empty' });
  }

  if (price !== null && (isNaN(price) || price < 0)) {
    console.error('Invalid price:', price);
    return res.status(400).json({ message: 'Price must be a valid non-negative number or null' });
  }

  const sql = 'UPDATE Memberships SET membership_type = ?, price = ? WHERE membership_type = ?';
  db.query(sql, [membership_type, price, oldMembershipType], (err, result) => {
    if (err) {
      console.error('Error updating membership entry:', err);
      return res.status(500).json({ message: 'Failed to update membership entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Membership entry not found:', oldMembershipType);
      return res.status(404).json({ message: 'Membership entry not found' });
    }
    console.log('Membership entry updated:', { membership_type });
    res.json({ message: 'Membership entry updated successfully' });
  });
});

// DELETE a membership entry
app.delete('/memberships/:membership_type', (req, res) => {
  const { membership_type } = req.params;

  if (!membership_type || membership_type.trim() === '') {
    console.error('Invalid membership_type:', membership_type);
    return res.status(400).json({ message: 'Membership type must be a valid string' });
  }

  const sql = 'DELETE FROM Memberships WHERE membership_type = ?';
  db.query(sql, [membership_type], (err, result) => {
    if (err) {
      console.error('Error deleting membership entry:', err);
      return res.status(500).json({ message: 'Failed to delete membership entry', error: err.message });
    }
    if (result.affectedRows === 0) {
      console.error('Membership entry not found:', membership_type);
      return res.status(404).json({ message: 'Membership entry not found' });
    }
    console.log('Membership entry deleted:', { membership_type });
    res.json({ message: 'Membership entry deleted successfully' });
  });
});


app.post("/addMemberships", (req, res) => {
  const { membership_type, price } = req.body;
  console.log('Request body:', req.body); // Log the request body

  // Validate inputs
  if (!membership_type || !price) {
    return res.status(400).json({ error: 'Membership type and price are required' });
  }

  // Ensure price is a valid number
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return res.status(400).json({ error: 'Price must be a valid number' });
  }

  const sql = 'INSERT INTO Memberships (membership_type, price) VALUES (?, ?)';
  db.query(sql, [membership_type, parsedPrice], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to add membership' });
    }
    res.json({ message: 'Membership added successfully', id: results.insertId });
  });
});




app.post("/addservices", (req, res) => {
  const { service } = req.body
  console.log('Request body:', req.body);  // Log the request bod

  if (!service) {
    return res.status(400).json({ error: 'Complaint is required' });
  }

  const sql = 'INSERT INTO services (service_name) VALUES (?)';
  db.query(sql, [service], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add complaint');
    res.json({ message: 'Complaint added successfully', id: results.insertId });
  });
})

//get data//
function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
app.get('/get-data', async (req, res) => {
  const { name, visited, businessname } = req.query;
  console.log('req->', req.query);

  if (!name) return res.status(400).json({ error: "Missing name" });
  if (!visited) return res.status(400).json({ error: "Missing visited" });
  if (!businessname) return res.status(400).json({ error: "Missing businessname" });

  try {
    const sysexamQuery = `SELECT sysexam_form FROM systemic_examination_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
    const birthHistoryQuery = `SELECT Birth_History FROM birth_history WHERE Name = ? AND Phone_Number = ? AND Visted = ?`;
    const anyOtherHistoryQuery = `SELECT Other_History FROM anyotherhistory WHERE Name = ? AND Phone_Number = ? AND Visted = ?`;
    const FamilyHistory = `SELECT * FROM famil_history WHERE Name = ? AND Phone_Number = ? AND Visted = ?`;
    const onexamform = `SELECT * FROM on_examination_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
    const general = `SELECT * FROM general_patient WHERE Name = ? AND Phone_Number = ? AND Visted = ?`;
    const priscriptionfrom = `SELECT * FROM prescription_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
    const surgical_history = `SELECT * FROM surgical_history WHERE Name = ? AND Phone_Number = ? AND Visted = ?`;
    const test = `SELECT * FROM test_to_take WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
    const Treatmentgiven = `SELECT * FROM treatment_given_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
    const dentalQuery = `SELECT * FROM dental_records WHERE Name = ? AND Phone_Number = ? AND Visit = ?`;

    const sysexamForms = await executeQuery(sysexamQuery, [name, businessname, visited]);
    const birthHistory = await executeQuery(birthHistoryQuery, [name, businessname, visited]);
    const anyOtherHistory = await executeQuery(anyOtherHistoryQuery, [name, businessname, visited]);
    const familyHistory = await executeQuery(FamilyHistory, [name, businessname, visited]);
    const Onexamination = await executeQuery(onexamform, [name, businessname, visited]);
    const patient = await executeQuery(general, [name, businessname, visited]);
    const priscriptionFrom = await executeQuery(priscriptionfrom, [name, businessname, visited]);
    const surgicalhistory = await executeQuery(surgical_history, [name, businessname, visited]);
    const testtotake = await executeQuery(test, [name, businessname, visited]);
    const treatmentgivenform = await executeQuery(Treatmentgiven, [name, businessname, visited]);
    const dentalData = await executeQuery(dentalQuery, [name, businessname, visited]);

    // Map dental data to sequential numbers (1-32), excluding non-dental fields
    const dentalMapped = {};
    if (dentalData.length > 0) {
      const dentalRecord = dentalData[dentalData.length - 1];
      Object.keys(dentalRecord).forEach((key) => {
        if (/^\d+$/.test(key) && parseInt(key) >= 1 && parseInt(key) <= 48) {
          dentalMapped[key] = dentalRecord[key] || "";
        }
      });
    }
    // console.log("treatmen=>>>>>>",treatmentgivenform)
    const responseData = {
      sysexam_forms: sysexamForms.map(row => row.sysexam_form),
      birthHistory: birthHistory.map(row => row.Birth_History),
      anyOtherHistory: anyOtherHistory.map(row => row.Other_History),
      familyHistory: familyHistory.map(row => row.Family_History),
      onexamform: Onexamination.map(row => row.onexam_form),
      patient: patient,
      LocalExamination: patient.length > 0 && patient[0].LocalExamination ? patient[0].LocalExamination : 'Previous Value Missing',
      Dignosis: patient.length > 0 && patient[0].Dignosis ? patient[0].Dignosis : 'Previous Value Missing',
      prescriptionForm: priscriptionFrom.map(row => ({
        medicine: row.Medicine,
        dosage: row.Dosage,
        timing: row.Timing,
        duration: row.Duration
      })),
      surgicalhistory: surgicalhistory.map(row => row.Surgical_History),
      testtotake: testtotake.map(row => row.TestToTake),
      treatmentgivenform: treatmentgivenform.map(row => ({
        treatmentgivenname: row.treatmentgivenname,
        treatmentdosage: row.Dosage,
        treatmentrout: row.Route_Of_Administration
      })),
      dental: dentalMapped, // Return only sequential dental data
    };

    console.log('Response Data ->', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('Error ->', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/delete-records', (req, res) => {
  const { name, visited, businessname } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Missing name" });
  }
  if (!visited) {
    return res.status(400).json({ error: "Missing visited" });
  }
  if (!businessname) {
    return res.status(400).json({ error: "Missing businessname" });
  }
  const queries = [
    `DELETE FROM systemic_examination_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`,
    `DELETE FROM birth_history WHERE Name = ? AND Phone_Number = ? AND Visted = ?`,
    `DELETE FROM anyotherhistory WHERE Name = ? AND Phone_Number = ? AND Visted = ?`,
    `DELETE FROM famil_history WHERE Name = ? AND Phone_Number = ? AND Visted = ?`,
    `DELETE FROM on_examination_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`,
    `DELETE FROM general_patient WHERE Name = ? AND Phone_Number = ? AND Visted = ?`,
    `DELETE FROM prescription_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`,
    `DELETE FROM surgical_history WHERE Name = ? AND Phone_Number = ? AND Visted = ?`,
    `DELETE FROM test_to_take WHERE Name = ? AND Phone_Number = ? AND Visited = ?`,
    `DELETE FROM treatment_given_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`,

  ];
  let successCount = 0;
  queries.forEach((query, index) => {
    console.log(query)
    db.query(query, [name, businessname, visited], (err, result) => {
      if (err) {
        console.error(`Error executing query ${index + 1}:`, err);
      } else {
        successCount++;
        console.log(`Query ${index + 1} executed successfully`);
      }
      if (index === queries.length - 1) {
        if (successCount === queries.length) {
          res.send({ message: 'All records deleted successfully' });
        } else {
          res.status(500).send({ error: 'Some records could not be deleted' });
        }
      }
    });
  });
});


// New dedicated dental data endpoint
app.get('/get-dental-data', async (req, res) => {
  const { name, visited, businessname } = req.query;

  if (!name || !visited || !businessname) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const dentalQuery = `SELECT * FROM dental_records WHERE Name = ? AND Phone_Number = ? AND Visit = ?`;
    const dentalData = await executeQuery(dentalQuery, [name, businessname, visited]);

    // Map dental data to actual tooth numbers with condition info
    const dentalMapped = {};
    if (dentalData.length > 0) {
      const dentalRecord = dentalData[0];

      // Mapping between sequential IDs (1-32) and actual tooth numbers
      const toothMapping = {
        1: '18', 2: '17', 3: '16', 4: '15', 5: '14', 6: '13', 7: '12', 8: '11',
        9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27', 16: '28',
        17: '38', 18: '37', 19: '36', 20: '35', 21: '34', 22: '33', 23: '32', 24: '31',
        25: '48', 26: '47', 27: '46', 28: '45', 29: '44', 30: '43', 31: '42', 32: '41'
      };

      // Process all teeth
      Object.keys(toothMapping).forEach((sequentialId) => {
        const toothNumber = toothMapping[sequentialId];
        const toothValue = dentalRecord[sequentialId];

        if (toothValue) {
          dentalMapped[toothNumber] = {
            condition: Object.keys(conditionMap).find(key => conditionMap[key] === toothValue) || toothValue,
            mapped: toothValue
          };
        } else {
          dentalMapped[toothNumber] = null; // Explicitly mark as no value
        }
      });
    }

    res.json({
      success: true,
      dentalData: dentalMapped
    });
  } catch (err) {
    console.error('Dental data error:', err);
    res.status(500).json({ error: "Failed to fetch dental data" });
  }
});


app.get('/get-visited', (req, res) => {
  const { full_name, phone_number } = req.query;
  if (!full_name) {
    return res.status(400).json({ error: "Missing name" });
  }
  if (!phone_number) {
    return res.status(400).json({ error: "Missing businessname" });
  }
  const sql = "SELECT MAX(visted) AS max_visited FROM patients WHERE full_name=? AND phone_number=?";
  db.query(sql, [full_name, phone_number], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    // [0].max_visited
    res.json(results[0].max_visited);
  });
})
app.put("/update-vitals/:Name/:Visit/:Phone_number", (req, res) => {
  console.log("Received data for update-vitals:", req.body);
  db.query(`SHOW COLUMNS FROM vitals`, (err, results) => {
    if (err) {
      console.error('Error fetching vitals columns:', err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    const fields = results.map((itm) => itm.Field);
    console.log('Vitals table columns:', fields);
    const updates = fields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => `\`${field}\` = ?`); // Use backticks for column names
    const values = fields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => req.body[field]);

    if (updates.length === 0) {
      console.log('No matching fields to update');
      return res.status(400).json({ message: "Invalid request: No matching fields" });
    }

    const query = `UPDATE vitals SET ${updates.join(", ")} WHERE Name = ? AND Visit = ? AND Phone_number = ?`;
    values.push(req.params.Name, req.params.Visit, req.params.Phone_number);

    console.log('Update Query:', query);
    console.log('Update Values:', values);

    db.query(query, values, (updateErr, result) => {
      if (updateErr) {
        console.error('Update error:', updateErr);
        return res.status(500).json({ message: "Update failed", error: updateErr.message });
      }
      console.log('Update Result:', result);
      res.json({ message: "Vitals updated successfully", affectedRows: result.affectedRows });
    });
  });
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(file);
    const phoneNumber = req.params.Phone_Number;
    const visited = req.params.Visted;
    const fileExt = path.extname(file.originalname);

    // ✅ Save original file name separately
    const originalFileName = file.originalname;
    const filename = `file_${originalFileName}_${phoneNumber}_${visited}_${Date.now()}${fileExt}`;

    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Upload route
app.post('/upload/:Phone_Number/:Visted/:Name', upload.array("upload", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const { Phone_Number, Visted, Name } = req.params;
  const fileData = req.files.map(file => ({
    filePath: `uploads/${file.filename}`, // e.g., uploads/captured-image-3_9994399232_1_1742398576699.jpg
    originalName: file.originalname
  }));

  const sql = `INSERT INTO uploaded_files (Phone_Number, Visted, FilePath, Name, File_Name) VALUES (?, ?, ?, ?, ?)`;
  fileData.forEach(({ filePath, originalName }) => {
    db.query(sql, [Phone_Number, Visted, filePath, Name, originalName], (err) => {
      if (err) {
        console.error('Database error:', err);
      }
    });
  });

  res.status(200).json({ success: true, message: 'Files uploaded successfully', fileData });
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API to fetch files
app.get('/files/:Phone_Number/:Visited/:Name', (req, res) => {
  const { Phone_Number, Visited, Name } = req.params;
  const sql = `SELECT * FROM uploaded_files WHERE Phone_Number = ? AND Visted = ? AND Name = ?`;
  db.query(sql, [Phone_Number, Visited, Name], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No files found for this user' });
    }
    res.status(200).json({ files: results });
  });
});

app.post('/addNurseName', (req, res) => {
  const { nurseName, location } = req.body;
  if (!nurseName || !location) {
    return res.status(400).json({ error: 'Nurse name and location are required' });
  }

  const sql = 'INSERT INTO nurses_name (name, location) VALUES (?, ?)';
  db.query(sql, [nurseName, location], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add nurse name');
    res.json({ message: 'Nurse name added successfully', id: results.insertId });
  });
});


app.post('/addLocation', (req, res) => {
  const { location } = req.body;
  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  const sql = 'INSERT INTO locations (location_name) VALUES (?)';
  db.query(sql, [location], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Location already exists' });
      }
      return handleError(err, res, 'Failed to add location');
    }
    res.json({ message: 'Location added successfully', id: results.insertId });
  });
});



app.post('/addDoctorName', (req, res) => {
  const { doctorName, location } = req.body;
  if (!doctorName || !location) {
    return res.status(400).json({ error: 'Doctor name and location are required' });
  }

  const sql = 'INSERT INTO doctors_name (name, location) VALUES (?, ?)';
  db.query(sql, [doctorName, location], (err, results) => {
    if (err) return handleError(err, res, 'Failed to add doctor name');
    res.json({ message: 'Doctor name added successfully', id: results.insertId });
  });
});


app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.put("/update-datas", (req, res) => {
  // vitals
  const vitals = req.body.vitals;
  console.log("vitals =>", vitals);
  console.log("data", req.body)

  if (!vitals || !vitals.Name || !vitals.Phone_number || !vitals.Visit) {
    return res.status(400).json({
      message: "Missing required fields: Phone_number, Name, or Visit",
    });
  }

  const identifiers = {
    Name: vitals.Name,
    Phone_number: vitals.Phone_number,
    Visit: vitals.Visit,
  };

  // Remove identifiers from update fields
  const updateFields = { ...vitals };
  delete updateFields.Name;
  delete updateFields.Phone_number;
  delete updateFields.Visit;

  const updateKeys = Object.keys(updateFields);
  if (updateKeys.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  // Replace _ with space in field names only for SQL
  const sqlSetClause = updateKeys
    .map(key => `\`${key.replace(/_/g, " ")}\` = ?`)
    .join(", ");

  const sqlValues = updateKeys.map(key => updateFields[key]);

  const sql = `UPDATE vitals SET ${sqlSetClause} WHERE Name = ? AND Phone_number = ? AND Visit = ?`;
  const values = [...sqlValues, identifiers.Name, identifiers.Phone_number, identifiers.Visit];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating vitals:", err);
      res.status(500).json({ message: "Failed to update vitals" });
    }
    // res.status(200).json({ message: "Vitals updated successfully", result });
  });

  // Family history
  const updateHistory = (tableName, columnName, historyArray, callback) => {
    if (!Array.isArray(historyArray)) return callback();
    const { Name, Phone_number, Visit } = req.body.formData;
    const deleteSql = `DELETE FROM \`${tableName}\` WHERE Name = ? AND Phone_number = ? AND Visted = ?`;
    db.query(deleteSql, [identifiers.Name, identifiers.Phone_number, identifiers.Visit], (deleteErr) => {
      if (deleteErr) return callback(deleteErr);
      if (historyArray.length === 0) return callback();
      const insertSql = `INSERT INTO \`${tableName}\` (Name, Phone_number, Visted, \`${columnName}\`) VALUES ?`;
      const values = historyArray.map((item) => [identifiers.Name, identifiers.Phone_number, identifiers.Visit, item]);

      db.query(insertSql, [values], callback);
    });
  };
  // console.log(req.body.formData.birthHistory)  
  // updateHistory("on_examination_form","onexam_form",req.body.formData.selectonexamination)
  updateHistory("birth_history", "Birth_History", req.body.formData.birthHistory, (err1) => {
    if (err1 != null) return res.status(500).json({ message: "Failed to update birth history", error: err1 });
    updateHistory("surgical_history", "Surgical_History", req.body.formData.surgicalHistory, (err2) => {
      if (err2 != null) return res.status(500).json({ message: "Failed to update surgical history", error: err2 });
      updateHistory("anyotherhistory", "Other_History", req.body.formData.otherHistory, (err3) => {
        if (err3 != null) return res.status(500).json({ message: "Failed to update other history", error: err3 });
        updateHistory("famil_history", "Family_History", req.body.formData.familyHistory, (err4) => {
          if (err4 != null) return res.status(500).json({ message: "Failed to update family history", error: err4 });
        })
      })
    })
  })

  // Diagnosis major complaint advice given localexaminiation 
  const checkExistQuery = `SELECT COUNT(1) AS count FROM general_patient WHERE Phone_Number = ? AND Visted = ?`;
  const checkValues = [identifiers.Phone_number, identifiers.Visit];

  db.query(checkExistQuery, checkValues, (err, results) => {
    if (err) {
      console.error("Error checking existence:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    const exists = results[0].count > 0;
    const data = req.body.formData;

    const fieldsMap = {
      Dignosis: data.dignosis,
      Major_Complaints: data.majorComplaints,
      LocalExamination: data.local,
      Advice_Given: data.advicegiven,
      FollowUpDate: data.followupdate,
      Name: identifiers.Name,
      Phone_Number: identifiers.Phone_number,
      Visted: identifiers.Visit
    };

    // Filter only defined fields
    const keys = Object.keys(fieldsMap).filter(key => fieldsMap[key] !== undefined && fieldsMap[key] !== null);
    const values = keys.map(key => fieldsMap[key]);

    if (exists) {
      const updateKeys = keys.filter(k => !["Phone_Number", "Visted"].includes(k));
      const updateQuery = `UPDATE general_patient SET ${updateKeys.map(k => `${k} = ?`).join(", ")} WHERE Phone_Number = ? AND Visted = ?`;
      const updateValues = updateKeys.map(k => fieldsMap[k]);
      updateValues.push(identifiers.Phone_number, identifiers.Visit);

      db.query(updateQuery, updateValues, (updateErr, updateResult) => {
        console.log(updateQuery,updateValues)
        if (updateErr) {
          console.error("Update error:", updateErr);
          return res.status(500).json({ message: "Failed to update", error: updateErr });
        }

        // res.status(200).json({ message: "Record updated successfully" });
        // return 0
      });

    } else {
      const insertQuery = `INSERT INTO general_patient (${keys.join(", ")}) VALUES (${keys.map(() => '?').join(", ")})`;

      db.query(insertQuery, values, (insertErr, insertResult) => {
        if (insertErr) {
          console.error("Insert error:", insertErr);
          return res.status(500).json({ message: "Failed to insert", error: insertErr });
        }
        // return res.json({ message: "Record inserted successfully", result: insertResult });
      });
    }
  });

  // console.log(req.body.formData.treatment)
  const deleteSql_for_treatment = `DELETE FROM treatment_given_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
  db.query(deleteSql_for_treatment, [identifiers.Name, identifiers.Phone_number, identifiers.Visit], (deleteErr) => {
    if (deleteErr) return res.status(500).json({ error: deleteErr });

    const treatments = req.body.formData.treatment;

    if (!Array.isArray(treatments) || treatments.length === 0) {
      return res.status(200).json({ message: "No treatments to insert." });
    }

    const insertSql = `
        INSERT INTO treatment_given_form 
        (Name, Phone_Number, Visited, Dosage, Route_Of_Administration, treatmentgivenname) 
        VALUES ?
      `;

    const values = treatments.map(item => [
      identifiers.Name,
      identifiers.Phone_number,
      identifiers.Visit,
      item.treatmentdosage,
      item.treatmentrout,
      item.treatmentgivenname
    ]);

    db.query(insertSql, [values], (insertErr, result) => {
      if (insertErr) return res.status(500).json({ error: insertErr });

      // return res.status(200).json({ message: "Treatment data updated successfully.", inserted: result.affectedRows });
    });
  })

  // prescription update
  const deleteSql_for_prescription = `DELETE FROM prescription_form WHERE Name = ? AND Phone_Number = ? AND Visited = ?`;
  const prescription = req.body.formData.prescription
  db.query(deleteSql_for_prescription, [identifiers.Name, identifiers.Phone_number, identifiers.Visit], (deleteErr) => {

    if (deleteErr) return res.status(500).json({ error: deleteErr });
    const insertsql_for_prescription = `INSERT INTO prescription_form (Name, Phone_Number, Visited, Medicine, Dosage, Timing,Duration) VALUES ?`
    const values = prescription.map(item => [
      identifiers.Name,
      identifiers.Phone_number,
      identifiers.Visit,
      item.medicine,
      item.dosage,
      item.timing,
      item.duration
    ])
    db.query(insertsql_for_prescription, [values], (insertErr, result) => {
      if (insertErr) console.error({ error: insertErr });
      // return res.status(200).json({ message: "prescription data updated successfully.", inserted: result.affectedRows });
    });
  })

  // Examform
  const updateExamination = (tableName, columnName, historyArray, callback) => {
    if (!Array.isArray(historyArray)) return callback();
    const { Name, Phone_number, Visit } = req.body.formData;
    const deleteSql = `DELETE FROM \`${tableName}\` WHERE Name = ? AND Phone_number = ? AND Visited = ?`;
    db.query(deleteSql, [identifiers.Name, identifiers.Phone_number, identifiers.Visit], (deleteErr) => {
      if (deleteErr) return callback(deleteErr);
      if (historyArray.length === 0) return callback();
      const insertSql = `INSERT INTO \`${tableName}\` (Name, Phone_Number, Visited, \`${columnName}\`) VALUES ?`;
      const values = historyArray.map((item) => [identifiers.Name, identifiers.Phone_number, identifiers.Visit, item]);

      db.query(insertSql, [values], callback);
    });
  };
  updateExamination("on_examination_form", "onexam_form", req.body.formData.selectonexamination, (err1) => {
    if (err1 != null) return res.status(500).json({ message: "Failed to update on examination", error: err1 });
  })
  updateExamination("systemic_examination_form", "sysexam_form", req.body.formData.selectsystematic, (err1) => {
    if (err1 != null) return res.status(500).json({ message: "Failed to update Symentic examination", error: err1 });
  })
  updateExamination("test_to_take", "TestToTake", req.body.formData.selectavailableTests, (err1) => {
    if (err1 != null) return res.status(500).json({ message: "Failed to update Test To Take", error: err1 });
  })

  // dental 
  if (Object.keys(req.body.formData.tooth).length > 0) {
    const deleteSql_for_dental = `DELETE FROM dental_records WHERE Name = ? AND Phone_Number = ? AND Visit = ?`
    db.query(deleteSql_for_dental, [identifiers.Name, identifiers.Phone_number, identifiers.Visit], err => {
      if (err) return res.status(500).json({ err: err })
      const dental = req.body.formData.tooth;
      // Ensure keys are 1 to 32
      if (!dental || typeof dental !== 'object') {
        return res.status(400).json({ error: "Invalid dental data" });
      }

      const keysArray = Object.keys(dental).sort((a, b) => a - b);
      const valuesArray = keysArray.map((key) => dental[key]);

      // Include Name, Phone, Visit in the final keys and values "Name", "Phone_Number", "Visit",
      const allKeys = [...keysArray.map(k => `\`${k}\``), "Name", "Phone_Number", "Visit"];
      // identifiers.Name, identifiers.Phone_number, identifiers.Visit,
      const allValues = [...valuesArray, identifiers.Name, identifiers.Phone_number, identifiers.Visit];
      console.log(allKeys)
      console.log(allValues)
      const placeholders = allValues.map(() => "?").join(", ");
      const sql = `INSERT INTO dental_records (${allKeys.join(", ")}) VALUES (${placeholders})`;
      console.log(req.body.formData.tooth)
      db.query(sql, allValues, (err, result) => {
        if (err) {
          console.error("DB Insert Error:", err);
          return res.status(500).json({ error: "Database insert failed" });
        }
        console.log({ message: "Dental record inserted successfully", id: result });
      });
    })
  }
})

app.get("/get-adminfiles", (req, res) => {
  const { full_name, Phone_number, visted, from_date, to_date } = req.query;
// AND p.Visted = bh.visit_number 
  let sql = `
    SELECT p.full_name, p.Phone_number, p.Visted, bh.total_price 
    FROM patients p 
    JOIN billing_headers bh 
    ON p.Phone_number = bh.Phone_number 
    WHERE p.status = 'billingcompleted' OR p.status='doctorcompleted'
  `;
  const params = [];

  if (full_name) {
    sql += " AND p.full_name LIKE ?";
    params.push(`%${full_name}%`);
  }

  if (Phone_number) {
    sql += " AND p.Phone_number LIKE ?";
    params.push(`%${Phone_number}%`);
  }

  if (visted) {
    sql += " AND p.Visted LIKE ?";
    params.push(`%${visted}%`);
  }

  if (from_date) {
    sql += " AND bh.billing_date >= ?";
    params.push(from_date);
  }

  if (to_date) {
    sql += " AND bh.billing_date <= ?";
    params.push(to_date);
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(result);
  });
});

app.get("/get-files", (req, res) => {
  const { full_name, Phone_number, visted, from_date, to_date } = req.query;

  let sql = `
    SELECT p.full_name, p.Phone_number, p.Visted, bh.total_price 
    FROM patients p 
    JOIN billing_headers bh 
    ON p.Phone_number = bh.Phone_number AND p.Visted = bh.visit_number 
    WHERE p.status = 'billingcompleted'
  `;
  const params = [];

  if (full_name) {
    sql += " AND p.full_name LIKE ?";
    params.push(`%${full_name}%`);
  }

  if (Phone_number) {
    sql += " AND p.Phone_number LIKE ?";
    params.push(`%${Phone_number}%`);
  }

  if (visted) {
    sql += " AND p.Visted LIKE ?";
    params.push(`%${visted}%`);
  }

  if (from_date) {
    sql += " AND bh.billing_date >= ?";
    params.push(from_date);
  }

  if (to_date) {
    sql += " AND bh.billing_date <= ?";
    params.push(to_date);
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(result);
  });
});

app.get("/get-total-price", (req, res) => {
  const { Phone_number, visit_number, from_date, to_date } = req.query;

  let sql = "SELECT SUM(total_price) as total_price FROM billing_headers WHERE 1=1";
  const params = [];

  if (Phone_number) {
    sql += " AND Phone_number LIKE ?";
    params.push(`%${Phone_number}%`);
  }

  if (visit_number) {
    sql += " AND visit_number LIKE ?";
    params.push(`%${visit_number}%`);
  }

  if (from_date) {
    sql += " AND billing_date >= ?";
    params.push(from_date);
  }

  if (to_date) {
    sql += " AND billing_date <= ?";
    params.push(to_date);
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ total_price: result[0].total_price || 0 });
  });
});


app.use('/files', express.static(path.join('bills')));

// Download Bills API
app.get('/downloadbill/:filename', (req, res) => {
  const filename = req.params.filename;
  const safeFilename = path.basename(filename); // Prevents path traversal
  const filePath = path.join(__dirname, 'bills', safeFilename);

  res.download(filePath, safeFilename, (err) => {
    if (err) {
      console.error("Download error:", err.message);
      res.status(404).json({ err: err.message });
    }
  });
});

app.post("/add-dental", (req, res) => {
  const { dental, encodedName, encodedPhone, encodedVisit } = req.body;
  console.log(req.body);

  if (!dental || typeof dental !== 'object') {
    return res.status(400).json({ error: "Invalid dental data" });
  }

  const keysArray = Object.keys(dental).sort((a, b) => a - b);
  const valuesArray = keysArray.map((key) => dental[key]);

  // Include Name, Phone, Visit in the final keys and values
  const allKeys = ["Name", "Phone_Number", "Visit", ...keysArray.map(k => `\`${k}\``)];
  const allValues = [encodedName, encodedPhone, encodedVisit, ...valuesArray];

  const placeholders = allValues.map(() => "?").join(", ");
  const sql = `INSERT INTO dental_records (${allKeys.join(", ")}) VALUES (${placeholders})`;

  db.query(sql, allValues, (err, result) => {
    if (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.status(200).json({ message: "Dental record inserted successfully", id: result });
  });
})

app.post("/addpaymentMethod",(req,res)=>{
  const {method}=req.body
  console.log(req.body)
  sql=`INSERT INTO payment_methods (method) VALUES (?)`
  db.query(sql,[method],(err,result)=>{
    if (err) {
      console.log(err)
      return res.status(500).json({error:err})
    }
    return res.status(200).json({message:result})
  })
})

app.get("/get-paymentMethod",(req,res)=>{
  sql=`SELECT * FROM payment_methods`
  db.query(sql,(err,result)=>{
    if(err){
      return res.status(500).json({error:err})
    }
    // .map(row => row.method)
    return res.status(200).json(result)
  })
})
app.delete('/delete-paymentMethod/:id',(req,res)=>{
  const { id } = req.params;
  const sql = 'DELETE FROM payment_methods WHERE payment_id = ?';
  console.log(req)
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting payment method:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json({ message: 'Payment method deleted successfully' });
  });

})
app.put('/update-PaymentMethod/:id',(req,res) => {
  const { id } = req.params;
  const { method } = req.body;

  if (!method || method.trim() === '') {
    return res.status(400).json({ message: 'Method name is required' });
  }
  const sql = 'UPDATE payment_methods SET method = ? WHERE payment_id = ?';
  db.query(sql, [method, id], (err, result) => {
    if (err) {
      console.error('Error updating payment method:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json({ message: 'Payment method updated successfully' });
  });})

  // get billing
  app.get('/get_billing/:phone_number/:visit_number/:user_name', (req, res) => {
  const { phone_number, visit_number, user_name } = req.params;

  const sql = 'SELECT * FROM billing_headers WHERE phone_number=? AND visit_number=? AND user_name=?';

  db.query(sql, [phone_number, visit_number, user_name], (err, result) => {
    if (err) {
      console.error("Header Query Error:", err);
      return res.status(400).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const out = result[result.length - 1]; // last record
    const billingId = out.id;

    const servicesql = 'SELECT * FROM billing_details WHERE billing_id = ?';
    db.query(servicesql, [billingId], (err, result2) => {
      if (err) {
        console.error("Details Query Error:", err);
        return res.status(500).json(err);
      }

      out.service = result2; // attach service details
      return res.status(200).json(out); // respond AFTER both queries complete
    });
  });
});
app.put('/api/update_billing', (req, res) => {
  console.log('Request body:', req.body);
  
  const {
    userId,
    userName,
    phoneNumber,
    visitNumber,
    nurseName,
    doctorName,
    billId,
    paymentMode,
    reviewDate,
    reference,
    membershipType,
    membershipPrice,
    membershipOffer,
    services,
    totalPrice,
    overallDiscount,
    date
  } = req.body;

  // Validation: Check if required fields are provided
  if (!billId) {
    return res.status(400).json({
      success: false,
      message: 'Bill ID is required for update'
    });
  }

  // Build dynamic SQL query for billing table update
  const updateFields = [];
  const updateValues = [];

  if (userId !== undefined) {
    updateFields.push('user_id = ?');
    updateValues.push(userId);
  }
  
  if (userName !== undefined) {
    updateFields.push('user_name = ?');
    updateValues.push(userName);
  }
  
  if (phoneNumber !== undefined) {
    updateFields.push('phone_number = ?');
    updateValues.push(phoneNumber);
  }
  
  if (visitNumber !== undefined) {
    updateFields.push('visit_number = ?');
    updateValues.push(visitNumber);
  }
  
  if (nurseName !== undefined) {
    updateFields.push('nurse_name = ?');
    updateValues.push(nurseName);
  }
  
  if (totalPrice !== undefined) {
    updateFields.push('total_price = ?');
    updateValues.push(parseFloat(totalPrice) || 0);
  }
  
  if (date !== undefined) {
    updateFields.push('billing_date = ?');
    updateValues.push(date);
  }
  
  if (paymentMode !== undefined) {
    updateFields.push('payment_method = ?');
    updateValues.push(paymentMode || null);
  }
  
  if (membershipType !== undefined) {
    updateFields.push('membership_type = ?');
    updateValues.push(membershipType || null);
  }
  
  if (reference !== undefined) {
    updateFields.push('reference = ?');
    updateValues.push(reference || null);
  }
  
  if (overallDiscount !== undefined) {
    updateFields.push('discount = ?');
    updateValues.push(parseInt(overallDiscount) || null);
  }
  
  if (membershipOffer !== undefined) {
    updateFields.push('membership_offer = ?');
    updateValues.push(membershipOffer || null);
  }
  
  if (membershipPrice !== undefined) {
    updateFields.push('membership_price = ?');
    updateValues.push(membershipPrice || null);
  }
  
  if(reviewDate !== undefined) {
    updateFields.push('review_date = ?');
    updateValues.push(reviewDate);
  }

  // Check if there are fields to update
  if (updateFields.length === 0 && !services) {
    return res.status(400).json({
      success: false,
      message: 'No fields provided for update'
    });
  }

  // Start a database transaction for updating both billing and services
  db.beginTransaction((transErr) => {
    if (transErr) {
      console.error('Transaction start error:', transErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to start database transaction',
        error: transErr.message
      });
    }

    // Function to handle rollback and error response
    const handleError = (error, message) => {
      db.rollback(() => {
        console.error(message, error);
        res.status(500).json({
          success: false,
          message: message,
          error: error.message
        });
      });
    };

    // Update billing table if there are fields to update
    const updateBillingTable = (callback) => {
      if (updateFields.length === 0) {
        return callback(null, { affectedRows: 0 });
      }

      updateValues.push(billId);
      const billingUpdateSql = `
        UPDATE billing_headers 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;

      console.log('Billing Update SQL:', billingUpdateSql);
      console.log('Billing Values:', updateValues);

      db.query(billingUpdateSql, updateValues, callback);
    };

    // Update services table
    const updateServicesTable = (callback) => {
      if (!services || !Array.isArray(services) || services.length === 0) {
        return callback(null, { affectedRows: 0 });
      }

      // First, delete existing services for this bill
      const deleteServicesSql = 'DELETE FROM billing_details WHERE billing_id = ?';
      
      db.query(deleteServicesSql, [billId], (deleteErr, deleteResults) => {
        if (deleteErr) {
          return callback(deleteErr);
        }

        console.log(`Deleted ${deleteResults.affectedRows} existing services`);

        // Method 1: Bulk insert with proper VALUES syntax
        if (services.length === 1) {
          // Single service insert
          const insertServiceSql = `
            INSERT INTO billing_details 
            (billing_id, service_name, detail, price, discount) 
            VALUES (?, ?, ?, ?, ?)
          `;

          const service = services[0];
          const serviceValues = [
            billId,
            service.service || '',
            service.details || service.detail || '',
            parseFloat(service.price) || 0,
            parseFloat(service.discount) || 0
          ];

          console.log('Single Service Insert SQL:', insertServiceSql);
          console.log('Single Service Values:', serviceValues);

          db.query(insertServiceSql, serviceValues, callback);
        } else {
          // Multiple services bulk insert
          const placeholders = services.map(() => '(?, ?, ?, ?, ?)').join(', ');
          const insertServicesSql = `
            INSERT INTO billing_details 
            (billing_id, service_name, detail, price, discount) 
            VALUES ${placeholders}
          `;

          // Flatten the values array
          const serviceValues = [];
          services.forEach(service => {
            serviceValues.push(
              billId,
              service.service || '',
              service.details || service.detail || '',
              parseFloat(service.price) || 0,
              parseFloat(service.discount) || 0
            );
          });

          console.log('Multiple Services Insert SQL:', insertServicesSql);
          console.log('Multiple Services Values:', serviceValues);

          db.query(insertServicesSql, serviceValues, callback);
        }
      });
    };

    // Alternative method: Insert services one by one (more reliable)
    const updateServicesTableOneByOne = (callback) => {
      if (!services || !Array.isArray(services) || services.length === 0) {
        return callback(null, { affectedRows: 0 });
      }

      // First, delete existing services for this bill
      const deleteServicesSql = 'DELETE FROM billing_details WHERE billing_id = ?';
      
      db.query(deleteServicesSql, [billId], (deleteErr, deleteResults) => {
        if (deleteErr) {
          return callback(deleteErr);
        }

        console.log(`Deleted ${deleteResults.affectedRows} existing services`);

        // Insert services one by one
        let insertedCount = 0;
        let hasError = false;

        if (services.length === 0) {
          return callback(null, { affectedRows: 0 });
        }

        const insertServiceSql = `
          INSERT INTO billing_details 
          (billing_id, service_name, detail, price, discount) 
          VALUES (?, ?, ?, ?, ?)
        `;

        services.forEach((service, index) => {
          if (hasError) return;
          const serviceValues = [
            billId,
            service.service || '',
            service.details || service.detail || '',
            parseFloat(service.price) || 0,
            parseFloat(service.discount) || 0
          ];

          console.log(`Inserting service ${index + 1}:`, serviceValues);
          db.query(insertServiceSql, serviceValues, (insertErr, insertResult) => {
            if (insertErr && !hasError) {
              hasError = true;
              return callback(insertErr);
            }

            insertedCount++;
            console.log(`Service ${index + 1} inserted successfully`);

            // Check if all services have been processed
            if (insertedCount === services.length && !hasError) {
              callback(null, { affectedRows: insertedCount });
            }
          });
        });
      });
    };

    // Execute billing table update
    updateBillingTable((billingErr, billingResults) => {
      if (billingErr) {
        return handleError(billingErr, 'Error updating billing table');
      }

      console.log('Billing table updated successfully');

      // Execute services table update (use the one-by-one method for reliability)
      updateServicesTableOneByOne((servicesErr, servicesResults) => {
        if (servicesErr) {
          return handleError(servicesErr, 'Error updating services table');
        }

        console.log('Services updated successfully');

        // Commit the transaction
        db.commit((commitErr) => {
          if (commitErr) {
            return handleError(commitErr, 'Error committing transaction');
          }

          console.log('Update successful - transaction committed');
          res.status(200).json({
            success: true,
            message: 'Billing record and services updated successfully',
            billingAffectedRows: billingResults.affectedRows,
            servicesUpdated: services ? services.length : 0
          });
        });
      });
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});