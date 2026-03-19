# CSIT314-Intelligent-Talent-Matching-Platform
Software respository for UOW CSIT314 group project. This web application is a 
recuritment system designed to improve the efficieny of job searching and talent acquisition.


## Step 1
Use pip or pipx to install the following libraries:
``` 
sudo pip install spacy
sudo pip install pdfminer
```
or 
```
sudo pipx install spacy
sudo pipx install pdfminer
```

## Step 2
To run the resume parser script, use the following command: 
```
python3 resumeScanner.py john_doe.resume.pdf
```

## Notes
Currently the experience and education are not provide great results in 
json output; but name, contact info, and skills are working well. However, certifications partially working. 
### Output

```
{
  "name": "John Doe\n\nSUMMARY",
  "contact": {
    "email": "john.doe@email.com",
    "phone": "+61 412 345 678",
    "github": "github.com/johndoe",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Results-driven Mechanical Engineer with 6+ years of experience in structural analysis, product design, and cross-functional\nproject delivery. Proven track record of reducing manufacturing costs and improving system reliability in aerospace and civil\ninfrastructure environments. Strong communicator with a passion for sustainable engineering solutions.",
  "experience": "Senior Mechanical Engineer\nAerotek Engineering Solutions | Sydney, NSW | Mar 2021 \u2013 Present\n\n- Led structural analysis of aircraft fuselage components using FEA tools (ANSYS, Abaqus), reducing material waste by\n18%.\n\n- Managed a team of 4 junior engineers on the redesign of hydraulic actuator systems for the A320 maintenance\nprogram.\n\n- Developed and maintained technical documentation compliant with AS9100D and EASA Part 21 standards.\n\n- Collaborated with supply chain to source ISO-certified titanium alloys, cutting lead time by 3 weeks per production\ncycle.\n\nMechanical Engineer\nBridgeCo Infrastructure | Melbourne, VIC | Jan 2019 \u2013 Feb 2021\n\n- Performed load analysis and fatigue modelling for pedestrian bridge designs across 12 government-funded projects.\n\n- Produced detailed CAD drawings in SolidWorks and AutoCAD; coordinated with civil team on foundation interfaces.\n\n- Conducted site inspections and wrote inspection reports for AS 3600 compliance across 8 construction sites.\n\n- Reduced rework rate by 22% through introduction of a design review checklist adopted company-wide.\n\nGraduate Engineer\nPrecision Dynamics Pty Ltd | Brisbane, QLD | Feb 2018 \u2013 Dec 2018\n\n- Assisted in design and prototyping of industrial conveyor systems for mining clients in the Pilbara region.\n\n- Ran thermal simulations to validate cooling system designs for heavy machinery enclosures.\n\n- Supported senior engineers in client presentations and tender documentation.",
  "education": "Bachelor of Engineering (Mechanical) \u2014 Honours\nUniversity of New South Wales (UNSW) | Sydney, NSW | 2014 \u2013 2017\n\nGPA: 6.4 / 7.0 | Thesis: Fatigue Life Prediction of Welded Steel Joints Under Variable Amplitude Loading\n\nCertificate IV in Project Management Practice\nTAFE NSW | 2020",
  "skills": [
    "abaqus",
    "ansys",
    "as9100",
    "autocad",
    "c",
    "catia",
    "fea",
    "gd&t",
    "iso 9001",
    "lean",
    "lean manufacturing",
    "matlab",
    "ms project",
    "python",
    "r",
    "solidworks"
  ],
  "projects": "Solar-Powered Water Pump \u2014 Personal Project (2022)\n\n- Designed and fabricated a low-cost solar-powered irrigation pump for a community garden in Western Sydney.\n\n- Handled full design cycle: requirements, CAD modelling, material selection, build, and field testing.\n\n\nFormula SAE \u2014 UNSW Racing Team (2016\u20132017)\n\n- Contributed to suspension geometry design and upright manufacturing for the competition vehicle.\n\n- Team placed 3rd in dynamic events at the Australasian Formula SAE competition, Melbourne 2017.",
  "certifications": [
    "ca",
    "en",
    "engineers australia",
    "first aid",
    "general construction induction",
    "mieaust",
    "ndis worker screening",
    "ner",
    "white card"
  ],
  "raw_text": "john.doe@email.com | +61 412 345 678 | linkedin.com/in/johndoe | github.com/johndoe | Sydney, NSW\n\nJohn Doe\n\nSUMMARY\n\nResults-driven Mechanical Engineer with 6+ years of experience in structural analysis, product design, and cross-functional\nproject delivery. Proven track record of reducing manufacturing costs and improving system reliability in aerospace and civil\ninfrastructure environments. Strong communicator with a passion for sustainable engineering solutions.\n\nEXPERIENCE\n\nSenior Mechanical Engineer\nAerotek Engineering Solutions | Sydney, NSW | Mar 2021 \u2013 Present\n\n- Led structural analysis of aircraft fuselage components using FEA tools (ANSYS, Abaqus), reducing material waste by\n18%.\n\n- Managed a team of 4 junior engineers on the redesign of hydraulic actuator systems for the A320 maintenance\nprogram.\n\n- Developed and maintained technical documentation compliant with AS9100D and EASA Part 21 standards.\n\n- Collaborated with supply chain to source ISO-certified titanium alloys, cutting lead time by 3 weeks per production\ncycle.\n\nMechanical Engineer\nBridgeCo Infrastructure | Melbourne, VIC | Jan 2019 \u2013 Feb 2021\n\n- Performed load analysis and fatigue modelling for pedestrian bridge designs across 12 government-funded projects.\n\n- Produced detailed CAD drawings in SolidWorks and AutoCAD; coordinated with civil team on foundation interfaces.\n\n- Conducted site inspections and wrote inspection reports for AS 3600 compliance across 8 construction sites.\n\n- Reduced rework rate by 22% through introduction of a design review checklist adopted company-wide.\n\nGraduate Engineer\nPrecision Dynamics Pty Ltd | Brisbane, QLD | Feb 2018 \u2013 Dec 2018\n\n- Assisted in design and prototyping of industrial conveyor systems for mining clients in the Pilbara region.\n\n- Ran thermal simulations to validate cooling system designs for heavy machinery enclosures.\n\n- Supported senior engineers in client presentations and tender documentation.\n\nEDUCATION\n\nBachelor of Engineering (Mechanical) \u2014 Honours\nUniversity of New South Wales (UNSW) | Sydney, NSW | 2014 \u2013 2017\n\nGPA: 6.4 / 7.0 | Thesis: Fatigue Life Prediction of Welded Steel Joints Under Variable Amplitude Loading\n\nCertificate IV in Project Management Practice\nTAFE NSW | 2020\n\nSKILLS\n\nCAD/CAE: SolidWorks, AutoCAD, CATIA V5, ANSYS, Abaqus   Programming: Python, MATLAB   Standards: AS 3600,\nAS9100D, ISO 9001, EASA Part 21   Other: GD&T, FEA, Lean Manufacturing, MS Project\n\nPROJECTS\n\nSolar-Powered Water Pump \u2014 Personal Project (2022)\n\n- Designed and fabricated a low-cost solar-powered irrigation pump for a community garden in Western Sydney.\n\n- Handled full design cycle: requirements, CAD modelling, material selection, build, and field testing.\n\n\fFormula SAE \u2014 UNSW Racing Team (2016\u20132017)\n\n- Contributed to suspension geometry design and upright manufacturing for the competition vehicle.\n\n- Team placed 3rd in dynamic events at the Australasian Formula SAE competition, Melbourne 2017.\n\nCERTIFICATIONS\n\n- Engineers Australia \u2014 MIEAust (Chartered, 2022)\n\n- NDIS Worker Screening Clearance (2021)\n\n- White Card \u2014 General Construction Induction (2018)\n\n- First Aid Certificate \u2014 St John Ambulance (2023)\n\n\f"
}
```
