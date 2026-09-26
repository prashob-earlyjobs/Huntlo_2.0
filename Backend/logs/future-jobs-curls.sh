# 2026-09-23T10:29:23.896Z POST /wl/search
curl -sS -X POST 'https://prod.api.futurejobs.ai/api/v1/wl/search' \
  -H 'Content-Type: application/json' \
  -H 'x-fj-api-key: fjk_sJCP5FZwo_iR_Zd8_Kc7_VWKh6Zgy9vMxG8aS354hiQ' \
  --data-raw '{"jdText":"nodejs developer from kerala","filters":{"region":{"type":"(.)","value":["Kerala"]}}}'
# 2026-09-23T10:29:41.036Z POST /wl/search response HTTP 200 17117ms
{
  "statusCode": 200,
  "data": [
    {
      "name": "Mohit Ajith",
      "headline": "MERN Stack Developer | Javascript | Node js | Express | MongoDB | PostgresSQL | Typescript | React",
      "region": "Kochi, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/2dcb714cb81efd8eb1e8bae34a7c5a9c0ab5191ed04c96da467265d60fda6192.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/mohit-ajith-3925a7244",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "SpiderWorks Technologies Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Nodejs Developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "Advertising Services"
          ],
          "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2025-07-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/spiderworks",
          "company_website_domain": "https://www.spiderworks.in",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/b27f0ae3cb3549b15697d48e65f8de91c1806190079c7d1fe0a168d38b1a243c.jpg",
          "company_headcount_latest": 137,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "Brototype",
          "seniority_level": "Entry Level",
          "title": "Full-stack Developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "E-Learning Providers"
          ],
          "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2023-10-01T00:00:00",
          "end_date": "2025-06-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/brototype",
          "company_website_domain": "https://brototype.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/25e6d4464c023cbde480ef809015c7571e51c3a3ad14b5d2e208aa23c9334aeb.jpg",
          "company_headcount_latest": 1648,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "SpiderWorks Technologies Pvt Ltd",
          "company_website_domain": "https://www.spiderworks.in",
          "job_title": "Nodejs Developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/spiderworks"
        }
      ],
      "basic_profile": {
        "current_title": "Nodejs Developer",
        "headline": "MERN Stack Developer | Javascript | Node js | Express | MongoDB | PostgresSQL | Typescript | React",
        "location": {
          "city": "Kochi",
          "continent": "Asia",
          "country": "India",
          "full_location": "Kochi, Kerala, India",
          "raw": "Kochi, Kerala, India",
          "state": "Kerala"
        },
        "name": "Mohit Ajith",
        "professional_network_name": "Mohit Ajith",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/2dcb714cb81efd8eb1e8bae34a7c5a9c0ab5191ed04c96da467265d60fda6192.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 137,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "Advertising Services"
              ],
              "company_professional_network_industry": "Advertising Services",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/spiderworks",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/b27f0ae3cb3549b15697d48e65f8de91c1806190079c7d1fe0a168d38b1a243c.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "https://www.spiderworks.in",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": true,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "SpiderWorks Technologies Pvt Ltd",
              "position_id": 2692603811,
              "professional_network_id": "10626398",
              "seniority_level": "Entry Level",
              "start_date": "2025-07-01T00:00:00",
              "title": "Nodejs Developer",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 1648,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "E-Learning Providers"
              ],
              "company_professional_network_industry": "E-Learning Providers",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/brototype",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/25e6d4464c023cbde480ef809015c7571e51c3a3ad14b5d2e208aa23c9334aeb.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "https://brototype.com",
              "employment_type": "",
              "end_date": "2025-06-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "name": "Brototype",
              "position_id": 2253883278,
              "professional_network_id": "31276398",
              "seniority_level": "Entry Level",
              "start_date": "2023-10-01T00:00:00",
              "title": "Full-stack Developer",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            }
          ]
        }
      },
      "education": {
        "schools": [
          {
            "degree": "Bachelor of Technology - BTech",
            "description": "",
            "end_year": 2023,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "15119524",
            "school": "S.N.Gurukulam College of Engineering, Kadayiruppu P.O., Kolencherry, Emakulam -682 311",
            "start_year": 2019
          },
          {
            "degree": "Bachelor of Technology - BTech",
            "description": "",
            "end_year": 2023,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "",
            "school": "S.N.Gurukulam College of Engineering, Kadayiruppu P.O., Kolencherry, Emakulam -682 311",
            "start_year": 2019
          }
        ]
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/mohit-ajith-3925a7244"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Abin Varghese",
      "headline": "Nodejs Developer | | | Node Js | Express Js | MongoDB | PostgreSQL | React Js",
      "region": "Kochi, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/8eeb9b8b8aa9cc51385146a700ca3dd80f5542787612439ef336172a13f39a28.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/abin-varghese-777150240",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "Mart2global Pvt. Ltd",
          "seniority_level": "Entry Level",
          "title": "Nodejs developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Ashram Road P.O, Gujarat University, Darpan Society, Navrangpura H.O, Gujarat, India",
          "function_category": "Engineering",
          "start_date": "2025-03-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/mart2global-pvt-ltd",
          "company_website_domain": "http://mart2global.com/",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/b72a8a0b15f47f90f4f7c0086e21889d0739c683766dff30b17a72fb6e86ce95.jpg",
          "company_headcount_latest": 34,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "Brototype",
          "seniority_level": "Entry Level",
          "title": "MERN stack developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 0,
          "company_type": "Privately Held",
          "company_industries": [
            "E-Learning Providers"
          ],
          "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2024-01-01T00:00:00",
          "end_date": "2024-12-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/brototype",
          "company_website_domain": "https://brototype.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/25e6d4464c023cbde480ef809015c7571e51c3a3ad14b5d2e208aa23c9334aeb.jpg",
          "company_headcount_latest": 1648,
          "employment_type": "",
          "business_email_verified": false
        },
        {
          "name": null,
          "seniority_level": "Entry Level",
          "title": "Full Stack Developer",
          "company_headcount_range": "",
          "years_at_company_raw": 0,
          "company_type": "",
          "company_industries": [],
          "company_hq_location": "",
          "function_category": "Engineering",
          "start_date": "2023-01-01T00:00:00",
          "end_date": "2023-12-01T00:00:00",
          "company_linkedin_profile_url": "",
          "company_website_domain": "",
          "company_profile_picture_permalink": "",
          "company_headcount_latest": 0,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "Mart2global Pvt. Ltd",
          "company_website_domain": "http://mart2global.com/",
          "job_title": "Nodejs developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/mart2global-pvt-ltd"
        }
      ],
      "basic_profile": {
        "current_title": "Nodejs developer",
        "headline": "Nodejs Developer | | | Node Js | Express Js | MongoDB | PostgreSQL | React Js",
        "location": {
          "city": "Kochi",
          "continent": "Asia",
          "country": "India",
          "full_location": "Kochi, Kerala, India",
          "raw": "Kochi, Kerala, India",
          "state": "Kerala"
        },
        "name": "Abin Varghese",
        "professional_network_name": "Abin Varghese",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/8eeb9b8b8aa9cc51385146a700ca3dd80f5542787612439ef336172a13f39a28.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 34,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Ashram Road P.O, Gujarat University, Darpan Society, Navrangpura H.O, Gujarat, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/mart2global-pvt-ltd",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/b72a8a0b15f47f90f4f7c0086e21889d0739c683766dff30b17a72fb6e86ce95.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://mart2global.com/",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": true,
              "location": {
                "raw": "Ahmedabad, Gujarat, India"
              },
              "name": "Mart2global Pvt. Ltd",
              "position_id": 2638713457,
              "professional_network_id": "86936652",
              "seniority_level": "Entry Level",
              "start_date": "2025-03-01T00:00:00",
              "title": "Nodejs developer",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 1648,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "E-Learning Providers"
              ],
              "company_professional_network_industry": "E-Learning Providers",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/brototype",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/25e6d4464c023cbde480ef809015c7571e51c3a3ad14b5d2e208aa23c9334aeb.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "https://brototype.com",
              "employment_type": "",
              "end_date": "2024-12-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "Brototype",
              "position_id": 2115901729,
              "professional_network_id": "31276398",
              "seniority_level": "Entry Level",
              "start_date": "2024-01-01T00:00:00",
              "title": "MERN stack developer",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            },
            {
              "business_email_verified": false,
              "company_headcount_latest": 0,
              "company_headcount_range": "",
              "company_headquarters_country": "",
              "company_hq_location": "",
              "company_hq_location_address_components": [],
              "company_industries": [],
              "company_professional_network_industry": "",
              "company_professional_network_profile_url": "",
              "company_profile_picture_permalink": "",
              "company_status": null,
              "company_type": "",
              "company_website": "",
              "employment_type": "",
              "end_date": "2023-12-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "name": null,
              "position_id": 2606086559,
              "professional_network_id": null,
              "seniority_level": "Entry Level",
              "start_date": "2023-01-01T00:00:00",
              "title": "Full Stack Developer",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            }
          ]
        }
      },
      "education": {
        "schools": [
          {
            "degree": "Bachelor's degree",
            "description": "",
            "end_year": 2022,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/2265ff225a80c10a87cc8880ca557e82eb1c4f589470e896211e5010ec7b7bfd.jpg",
            "location": {
              "city": "Thiruvananthapuram",
              "continent": "Asia",
              "country": "India",
              "raw": "Thiruvananthapuram, Palayam, Trivandrum",
              "state": "Kerala"
            },
            "professional_network_id": "1483508",
            "school": "University of Kerala",
            "start_year": 2019
          },
          {
            "degree": "Bachelor's degree",
            "description": "",
            "end_year": 2022,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "13660",
            "school": "University of Kerala",
            "start_year": 2019
          },
          {
            "degree": "Bsc computer science",
            "description": "",
            "end_year": null,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "",
            "school": "Naipunnya school of management, cherthala",
            "start_year": null
          }
        ]
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/abin-varghese-777150240"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Pranav C",
      "headline": "Node js Developer",
      "region": "Malappuram, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/fbc2c330bdbbc4ad3e16ad1aacbf6134e3412be246818d8c7fce7c00013d597c.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/pranav-c-4aa4b5270",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "Sesame Technologies Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Node js Developer",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 2,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Govinda Puram, Nellicode, Kuthiravattom, Kottuli, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2024-09-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/sesame-technologies-pvt-ltd",
          "company_website_domain": "http://www.sesametechnologies.net",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c9b34dca6f195470c5c3113277a22a8c38e1f33a24869c61d54b5714ce2cd9e4.jpg",
          "company_headcount_latest": 28,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "Sesame Technologies Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Node js Developer",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 0,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Govinda Puram, Nellicode, Kuthiravattom, Kottuli, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2024-09-01T00:00:00",
          "end_date": "2024-12-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/sesame-technologies-pvt-ltd",
          "company_website_domain": "http://www.sesametechnologies.net",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c9b34dca6f195470c5c3113277a22a8c38e1f33a24869c61d54b5714ce2cd9e4.jpg",
          "company_headcount_latest": 28,
          "employment_type": "",
          "business_email_verified": false
        },
        {
          "name": "Softroniics",
          "seniority_level": "In Training",
          "title": "Intern",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 0,
          "company_type": "Partnership",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Calicut City, Puthiyara, Thiruthiyad, Kerala, India",
          "function_category": "",
          "start_date": "2024-02-01T00:00:00",
          "end_date": "2024-05-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/softroniics",
          "company_website_domain": "https://softroniics.com/",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/5d4cfdbc18ed732fd7c44db74d1cb2036fdedee62ee33d5213ba0aad96f5640c.jpg",
          "company_headcount_latest": 678,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "Sesame Technologies Pvt Ltd",
          "company_website_domain": "http://www.sesametechnologies.net",
          "job_title": "Node js Developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/sesame-technologies-pvt-ltd"
        }
      ],
      "basic_profile": {
        "current_title": "Node js Developer",
        "headline": "Node js Developer",
        "location": {
          "city": "Malappuram",
          "continent": "Asia",
          "country": "India",
          "full_location": "Malappuram, Kerala, India",
          "raw": "Malappuram, Kerala, India",
          "state": "Kerala"
        },
        "name": "Pranav C",
        "professional_network_name": "Pranav C",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/fbc2c330bdbbc4ad3e16ad1aacbf6134e3412be246818d8c7fce7c00013d597c.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 28,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Govinda Puram, Nellicode, Kuthiravattom, Kottuli, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/sesame-technologies-pvt-ltd",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c9b34dca6f195470c5c3113277a22a8c38e1f33a24869c61d54b5714ce2cd9e4.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.sesametechnologies.net",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": true,
              "location": {
                "raw": "Kozhikode"
              },
              "name": "Sesame Technologies Pvt Ltd",
              "position_id": 2612238946,
              "professional_network_id": "3324567",
              "seniority_level": "Entry Level",
              "start_date": "2024-09-01T00:00:00",
              "title": "Node js Developer",
              "years_at_company": "3 to 5 years",
              "years_at_company_raw": 2
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 28,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Govinda Puram, Nellicode, Kuthiravattom, Kottuli, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/sesame-technologies-pvt-ltd",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c9b34dca6f195470c5c3113277a22a8c38e1f33a24869c61d54b5714ce2cd9e4.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.sesametechnologies.net",
              "employment_type": "",
              "end_date": "2024-12-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kozhikode, Kerala, India"
              },
              "name": "Sesame Technologies Pvt Ltd",
              "position_id": 2578747356,
              "professional_network_id": "3324567",
              "seniority_level": "Entry Level",
              "start_date": "2024-09-01T00:00:00",
              "title": "Node js Developer",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            },
            {
              "business_email_verified": false,
              "company_headcount_latest": 678,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Calicut City, Puthiyara, Thiruthiyad, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/softroniics",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/5d4cfdbc18ed732fd7c44db74d1cb2036fdedee62ee33d5213ba0aad96f5640c.jpg",
              "company_status": "active",
              "company_type": "Partnership",
              "company_website": "https://softroniics.com/",
              "employment_type": "",
              "end_date": "2024-05-01T00:00:00",
              "function_category": "",
              "is_default": false,
              "location": {
                "raw": "Kozhikode, Kerala, India"
              },
              "name": "Softroniics",
              "position_id": 2401512303,
              "professional_network_id": "89317933",
              "seniority_level": "In Training",
              "start_date": "2024-02-01T00:00:00",
              "title": "Intern",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            }
          ]
        }
      },
      "education": {
        "schools": [
          {
            "degree": "Bachelor's degree",
            "description": "",
            "end_year": 2021,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/123947f3d069d84bf5162c0cef3f40b47c5e23a3b81aac1b41f7fbc197a855cd.jpg",
            "location": {
              "city": null,
              "continent": "Asia",
              "country": "India",
              "raw": "Calicut University PO Malappuram",
              "state": "Kerala"
            },
            "professional_network_id": "15105611",
            "school": "Calicut University, Thenhipalem, Malapuram",
            "start_year": 2018
          },
          {
            "degree": "Postgraduate Diploma",
            "description": "",
            "end_year": 2022,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "",
            "school": "LBS Centre for Science and Technology",
            "start_year": 2021
          },
          {
            "degree": "Bachelor's degree",
            "description": "",
            "end_year": 2021,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/4b8439097df7f0153b84dfe311e2bd04ff6d0bbef38dd5acd0ea4e35b10391d6.jpg",
            "location": {
              "city": "Rio de Janeiro",
              "continent": "South America",
              "country": "Brazil",
              "raw": "Av. das Américas",
              "state": "State of Rio de Janeiro"
            },
            "professional_network_id": "203371",
            "school": "Calicut University, Thenhipalem, Malapuram",
            "start_year": 2018
          },
          {
            "degree": "Master of Computer Applications - MCA",
            "description": "",
            "end_year": 2024,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/0bbc69a7482faeeb25c7c75bb34ef7009acd19d73db72858a59c2a900dbaebe3.jpg",
            "location": {
              "city": null,
              "continent": "Asia",
              "country": "India",
              "raw": "APJ Abdul Kalam Technological University CET Campus",
              "state": "Kerala"
            },
            "professional_network_id": "13761916",
            "school": "APJ Abdul Kalam Technological University",
            "start_year": 2022
          },
          {
            "degree": "Master of Computer Applications - MCA",
            "description": "",
            "end_year": 2024,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/b338c79d97b9a1f53bcf28f738727c08950dce02dc212e49b12c65d6e965f502.jpg",
            "location": {
              "city": "Rochester",
              "continent": "North America",
              "country": "United States",
              "raw": "3300 Dewey Avenue",
              "state": "New York"
            },
            "professional_network_id": "3233827",
            "school": "APJ Abdul Kalam Technological University",
            "start_year": 2022
          }
        ]
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/pranav-c-4aa4b5270"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Rashida K",
      "headline": "Back End Developer-Node js",
      "region": "Kozhikode, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/25499a300f4e34fd02f1c6fb3f570012e70ecfc85cbe77917a74606105ef52ed.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/rashida-k-851360259",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "Nucore Software Solutions",
          "seniority_level": "Entry Level",
          "title": "Node js developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 2,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Iringallur, Guruvayurappan College, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2024-03-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/nucoresoftware",
          "company_website_domain": "http://www.nucore.in",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/2ad20ed59a027ff82604310f10b4eb676f7c3d8d9a422deb7e1ed1b4c964cf99.jpg",
          "company_headcount_latest": 201,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "Luminar Technolab",
          "seniority_level": "In Training",
          "title": "Intern",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 0,
          "company_type": "Educational Institution",
          "company_industries": [
            "Education Administration Programs"
          ],
          "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
          "function_category": "",
          "start_date": "2023-09-01T00:00:00",
          "end_date": "2024-03-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/luminartechnolab",
          "company_website_domain": "https://www.luminartechnolab.com/",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/5ca257aa8fd53cc9a882b8e351a0b975321573c62d6b2bd1fa407c1b0ebdbebe.jpg",
          "company_headcount_latest": 5223,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "Nucore Software Solutions",
          "company_website_domain": "http://www.nucore.in",
          "job_title": "Node js developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/nucoresoftware"
        }
      ],
      "basic_profile": {
        "current_title": "Node js developer",
        "headline": "Back End Developer-Node js",
        "location": {
          "city": "Kozhikode",
          "continent": "Asia",
          "country": "India",
          "full_location": "Kozhikode, Kerala, India",
          "raw": "Kozhikode, Kerala, India",
          "state": "Kerala"
        },
        "name": "Rashida K",
        "professional_network_name": "Rashida K",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/25499a300f4e34fd02f1c6fb3f570012e70ecfc85cbe77917a74606105ef52ed.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 201,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Iringallur, Guruvayurappan College, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/nucoresoftware",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/2ad20ed59a027ff82604310f10b4eb676f7c3d8d9a422deb7e1ed1b4c964cf99.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.nucore.in",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kozhikode, Kerala, India"
              },
              "name": "Nucore Software Solutions",
              "position_id": 2504549251,
              "professional_network_id": "1931567",
              "seniority_level": "Entry Level",
              "start_date": "2024-03-01T00:00:00",
              "title": "Node js developer",
              "years_at_company": "3 to 5 years",
              "years_at_company_raw": 2
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 5223,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "India",
              "company_hq_location": "Kakkanad, Kakkanad West, Kusumagiri, Thengod, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "Education Administration Programs"
              ],
              "company_professional_network_industry": "Education Administration Programs",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/luminartechnolab",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/5ca257aa8fd53cc9a882b8e351a0b975321573c62d6b2bd1fa407c1b0ebdbebe.jpg",
              "company_status": "active",
              "company_type": "Educational Institution",
              "company_website": "https://www.luminartechnolab.com/",
              "employment_type": "",
              "end_date": "2024-03-01T00:00:00",
              "function_category": "",
              "is_default": false,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "Luminar Technolab",
              "position_id": 2290839759,
              "professional_network_id": "14509582",
              "seniority_level": "In Training",
              "start_date": "2023-09-01T00:00:00",
              "title": "Intern",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            }
          ]
        }
      },
      "education": {
        "schools": [
          {
            "degree": "Master of Technology - MTech",
            "description": "",
            "end_year": 2023,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/f598efd195aac5488f7fac8be48cb4225299485582fc2a0f2de49d9b87ccec80.jpg",
            "location": {
              "city": null,
              "continent": "Asia",
              "country": "India",
              "raw": "Mar Athanasius College of Engineering",
              "state": "Kerala"
            },
            "professional_network_id": "11442301",
            "school": "Mar Athanasius College of Engineering",
            "start_year": 2021
          },
          {
            "degree": "Bachelor of Technology - BTech",
            "description": "",
            "end_year": null,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/5af326800acf7221c8e73e173396b37726f0fee7c1b464a9ae699201f0ae9a5e.jpg",
            "location": {
              "city": "Kannur",
              "continent": "Asia",
              "country": "India",
              "raw": "Parassinikkadavu-Mayyil Road",
              "state": "Kerala"
            },
            "professional_network_id": "28728845",
            "school": "Government College Of Engineering Kannur",
            "start_year": null
          }
        ]
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/rashida-k-851360259"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "ISHAQ P P",
      "headline": "MERN STACK DEVELOPER | Node.JS | React| JavaScript  | MongoDB | Express.JS | GIT & GitHub | MySQL| NGINX",
      "region": "Malappuram, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/8bf82a6619814ac466600e0c081bcee6659f76283a82467f24316bb1acd3dad7.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/ishaq-pp",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "eSynergy Software Technologies",
          "seniority_level": "Entry Level",
          "title": "Node js developer ",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 3,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "St.Vincent Colony, Eranhipalam, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2023-05-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/esynergysoftwares",
          "company_website_domain": "http://www.esynergysoft.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/00d52a51ff375e0a0511ca27c493248248ac027a1a75253ba81a1b25fd37eb6b.jpg",
          "company_headcount_latest": 49,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [],
      "current_employers_object": [
        {
          "company_name": "eSynergy Software Technologies",
          "company_website_domain": "http://www.esynergysoft.com",
          "job_title": "Node js developer ",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/esynergysoftwares"
        }
      ],
      "basic_profile": {
        "current_title": "Node js developer ",
        "headline": "MERN STACK DEVELOPER | Node.JS | React| JavaScript  | MongoDB | Express.JS | GIT & GitHub | MySQL| NGINX",
        "location": {
          "city": "Malappuram",
          "continent": "Asia",
          "country": "India",
          "full_location": "Malappuram, Kerala, India",
          "raw": "Malappuram, Kerala, India",
          "state": "Kerala"
        },
        "name": "ISHAQ P P",
        "professional_network_name": "ISHAQ P P",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/8bf82a6619814ac466600e0c081bcee6659f76283a82467f24316bb1acd3dad7.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 49,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "St.Vincent Colony, Eranhipalam, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/esynergysoftwares",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/00d52a51ff375e0a0511ca27c493248248ac027a1a75253ba81a1b25fd37eb6b.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.esynergysoft.com",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": false,
              "name": "eSynergy Software Technologies",
              "position_id": 2238789721,
              "professional_network_id": "76270323",
              "seniority_level": "Entry Level",
              "start_date": "2023-05-01T00:00:00",
              "title": "Node js developer ",
              "years_at_company": "3 to 5 years",
              "years_at_company_raw": 3
            }
          ],
          "past": []
        }
      },
      "education": {
        "schools": [
          {
            "degree": "Bachelor of Technology - BTech",
            "description": "",
            "end_year": 2022,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/5dde6b2e0046ce67f2c69ec39cb69d00914ff828dc7c22197d070e3afead776e.jpg",
            "location": {
              "city": null,
              "continent": "Asia",
              "country": "India",
              "raw": "Thiruvananthapuram, Kerala",
              "state": "Kerala"
            },
            "professional_network_id": "15107290",
            "school": "College of Engineering, Trivandrum",
            "start_year": 2019
          },
          {
            "degree": "Diploma of Education",
            "description": "",
            "end_year": 2018,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "7172071",
            "school": "MADIN POLYTECHNIC COLLEGE",
            "start_year": 2015
          },
          {
            "degree": "Diploma of Education",
            "description": "",
            "end_year": 2018,
            "institute_logo_permalink": null,
            "location": {
              "city": null,
              "continent": null,
              "country": null,
              "raw": null,
              "state": null
            },
            "professional_network_id": "",
            "school": "Madin Polytechnic College Malappuram",
            "start_year": 2015
          }
        ]
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/ishaq-pp"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Raveena Raj",
      "headline": "Node.js Developer",
      "region": "Kochi, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/872606cac400e1cce6cc2aa5620a7f74350a28f2101fba69b8944d57cb67ed7a.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/raveena-raj-7a3bb7288",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "AIRO GLOBAL SOFTWARE (P) LTD",
          "seniority_level": "Entry Level",
          "title": "Node js developer",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Infopark-Kochi, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2024-12-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/airo-global-software",
          "company_website_domain": "https://airoglobal.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/af1fedef6a9ff3e1bd7d239fdcc3e8090249b66da748a8d63090c49d746e2fc4.jpg",
          "company_headcount_latest": 24,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "NUOX Technologies",
          "seniority_level": "Entry Level",
          "title": "Node.js Developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 0,
          "company_type": "Partnership",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Dubai, Dubai, United Arab Emirates",
          "function_category": "Engineering",
          "start_date": "2023-11-01T00:00:00",
          "end_date": "2024-06-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/nuox",
          "company_website_domain": "https://www.nuox.io",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/85cc9a2c72fc1374e975803af3c25ecb989a4e5cf8c46b7bea8c9663774eb13a.jpg",
          "company_headcount_latest": 45,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "AIRO GLOBAL SOFTWARE (P) LTD",
          "company_website_domain": "https://airoglobal.com",
          "job_title": "Node js developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/airo-global-software"
        }
      ],
      "basic_profile": {
        "current_title": "Node js developer",
        "headline": "Node.js Developer",
        "location": {
          "city": "Kochi",
          "continent": "Asia",
          "country": "India",
          "full_location": "Kochi, Kerala, India",
          "raw": "Kochi, Kerala, India",
          "state": "Kerala"
        },
        "name": "Raveena Raj",
        "professional_network_name": "Raveena Raj",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/872606cac400e1cce6cc2aa5620a7f74350a28f2101fba69b8944d57cb67ed7a.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 24,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Infopark-Kochi, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/airo-global-software",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/af1fedef6a9ff3e1bd7d239fdcc3e8090249b66da748a8d63090c49d746e2fc4.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "https://airoglobal.com",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "AIRO GLOBAL SOFTWARE (P) LTD",
              "position_id": 0,
              "professional_network_id": "3675223",
              "seniority_level": "Entry Level",
              "start_date": "2024-12-01T00:00:00",
              "title": "Node js developer",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 45,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "United Arab Emirates",
              "company_hq_location": "Dubai, Dubai, United Arab Emirates",
              "company_hq_location_address_components": [
                "Dubai",
                "Dubai",
                "United Arab Emirates"
              ],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/nuox",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/85cc9a2c72fc1374e975803af3c25ecb989a4e5cf8c46b7bea8c9663774eb13a.jpg",
              "company_status": "active",
              "company_type": "Partnership",
              "company_website": "https://www.nuox.io",
              "employment_type": "",
              "end_date": "2024-06-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kozhikode, Kerala, India"
              },
              "name": "NUOX Technologies",
              "position_id": 0,
              "professional_network_id": "68542212",
              "seniority_level": "Entry Level",
              "start_date": "2023-11-01T00:00:00",
              "title": "Node.js Developer",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            }
          ]
        }
      },
      "education": {
        "schools": []
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/raveena-raj-7a3bb7288"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Neenu Krishnan",
      "headline": "Node.js Developer | Backend Developer| Express.js | MySQL | MongoDB | Redis | Kafka | JavaScript | Git | AWS | Docker | React",
      "region": "Ernakulam, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/fad6a147b9f079cb9d4e0a64b508f3e0c38c03f0abad0efe77273a6db8aad120.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/neenu-krishnan",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "Gipra Business Solution Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Node Developer",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 3,
          "company_type": "Privately Held",
          "company_industries": [
            "Software Development"
          ],
          "company_hq_location": "Edapally, Edapally North, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2023-06-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/giprabusinesssolutionpvtltd",
          "company_website_domain": "http://www.gipra.in",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/f6f193c7a57af58faad7a1b382b5ecefb2f88c15a0e86c57fcba2f335ab6c2d5.jpg",
          "company_headcount_latest": 15,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "Brand Guru Insights Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Web Developer",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "Advertising Services"
          ],
          "company_hq_location": "Vyttila, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2022-04-01T00:00:00",
          "end_date": "2023-06-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/debrandguru",
          "company_website_domain": "https://www.debrandguru.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/8ad752991135a4cd80373ea3f4aefdb1f0668567e951d9a46b36adbb3e39df40.jpg",
          "company_headcount_latest": 8,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "Gipra Business Solution Pvt Ltd",
          "company_website_domain": "http://www.gipra.in",
          "job_title": "Node Developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/giprabusinesssolutionpvtltd"
        }
      ],
      "basic_profile": {
        "current_title": "Node Developer",
        "headline": "Node.js Developer | Backend Developer| Express.js | MySQL | MongoDB | Redis | Kafka | JavaScript | Git | AWS | Docker | React",
        "location": {
          "city": "Ernakulam",
          "continent": "Asia",
          "country": "India",
          "full_location": "Ernakulam, Kerala, India",
          "raw": "Ernakulam, Kerala, India",
          "state": "Kerala"
        },
        "name": "Neenu Krishnan",
        "professional_network_name": "Neenu Krishnan",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/fad6a147b9f079cb9d4e0a64b508f3e0c38c03f0abad0efe77273a6db8aad120.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 15,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Edapally, Edapally North, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "Software Development"
              ],
              "company_professional_network_industry": "Software Development",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/giprabusinesssolutionpvtltd",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/f6f193c7a57af58faad7a1b382b5ecefb2f88c15a0e86c57fcba2f335ab6c2d5.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.gipra.in",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "Gipra Business Solution Pvt Ltd",
              "position_id": 1601694000,
              "professional_network_id": "75527502",
              "seniority_level": "Entry Level",
              "start_date": "2023-06-01T00:00:00",
              "title": "Node Developer",
              "years_at_company": "3 to 5 years",
              "years_at_company_raw": 3
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 8,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Vyttila, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "Advertising Services"
              ],
              "company_professional_network_industry": "Advertising Services",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/debrandguru",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/8ad752991135a4cd80373ea3f4aefdb1f0668567e951d9a46b36adbb3e39df40.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "https://www.debrandguru.com",
              "employment_type": "",
              "end_date": "2023-06-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "name": "Brand Guru Insights Pvt Ltd",
              "position_id": 1601694001,
              "professional_network_id": "13661244",
              "seniority_level": "Entry Level",
              "start_date": "2022-04-01T00:00:00",
              "title": "Web Developer",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            }
          ]
        }
      },
      "education": {
        "schools": []
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/neenu-krishnan"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Keerthana Prakash",
      "headline": "NodeJS Developer",
      "region": "Ernakulam, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/0c7f80bd0f429f54f7643e597d990aabef6caaedad544dc28fc9f8cde063999c.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/keerthana-prakash-7010081a3",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "Orion Innovation",
          "seniority_level": "Entry Level",
          "title": "Full-stack Developer",
          "company_headcount_range": "5001-10000",
          "years_at_company_raw": 2,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Iselin, New Jersey, United States",
          "function_category": "Engineering",
          "start_date": "2024-04-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/orioninnovation",
          "company_website_domain": "https://www.orioninnovation.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/831dc083275a63e080220a9592f61cd1c3a4d11adc97f73f448f65c0b17d2d3a.jpg",
          "company_headcount_latest": 5086,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "Chillar Payment Solutions Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Node js  developer ",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "Financial Services"
          ],
          "company_hq_location": "Ambalamedu, Karimugal, Brahmapuram, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2023-02-01T00:00:00",
          "end_date": "2024-02-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/chillar-payment-solutions-pvt-ltd",
          "company_website_domain": "http://www.chillarpayments.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c1461d6c86c59d6588725661acfb8f99f6b2c11cfd420590caa2ab2e73a0a30e.jpg",
          "company_headcount_latest": 31,
          "employment_type": "",
          "business_email_verified": false
        },
        {
          "name": "Armino Technologies",
          "seniority_level": "Entry Level",
          "title": "Full-stack Developer",
          "company_headcount_range": "11-50",
          "years_at_company_raw": 0,
          "company_type": "Privately Held",
          "company_industries": [
            "Software Development"
          ],
          "company_hq_location": "Nadakavu, Vellayil, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2022-04-01T00:00:00",
          "end_date": "2023-01-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/armino",
          "company_website_domain": "http://www.armino.in",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c76eca1d4c36bd77df7749fdd8fe6fc5892be6550cfa360939ad9600a8df756f.jpg",
          "company_headcount_latest": 26,
          "employment_type": "",
          "business_email_verified": false
        },
        {
          "name": "Touchworld Technology LLC",
          "seniority_level": "Entry Level",
          "title": "NodeJS Developer",
          "company_headcount_range": "51-200",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Dubai, United Arab Emirates, Dubai, United Arab Emirates",
          "function_category": "Engineering",
          "start_date": "2020-09-01T00:00:00",
          "end_date": "2022-04-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/touchworld-technology-llc",
          "company_website_domain": "http://www.touchworldtech.com/",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/f41a352f83496982e49aa33309643e0b0376e62e83c1b24ee4d56cfab789f062.jpg",
          "company_headcount_latest": 78,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "current_employers_object": [
        {
          "company_name": "Orion Innovation",
          "company_website_domain": "https://www.orioninnovation.com",
          "job_title": "Full-stack Developer",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/orioninnovation"
        }
      ],
      "basic_profile": {
        "current_title": "Full-stack Developer",
        "headline": "NodeJS Developer",
        "location": {
          "city": "Ernakulam",
          "continent": "Asia",
          "country": "India",
          "full_location": "Ernakulam, Kerala, India",
          "raw": "Ernakulam, Kerala, India",
          "state": "Kerala"
        },
        "name": "Keerthana Prakash",
        "professional_network_name": "Keerthana Prakash",
        "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/0c7f80bd0f429f54f7643e597d990aabef6caaedad544dc28fc9f8cde063999c.jpg"
      },
      "experience": {
        "employment_details": {
          "current": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 5086,
              "company_headcount_range": "5001-10000",
              "company_headquarters_country": "United States",
              "company_hq_location": "Iselin, New Jersey, United States",
              "company_hq_location_address_components": [
                "Iselin",
                "Woodbridge Township",
                "Middlesex County",
                "New Jersey",
                "United States"
              ],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/orioninnovation",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/831dc083275a63e080220a9592f61cd1c3a4d11adc97f73f448f65c0b17d2d3a.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "https://www.orioninnovation.com",
              "employment_type": "",
              "end_date": null,
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "Orion Innovation",
              "position_id": 2407655867,
              "professional_network_id": "299849",
              "seniority_level": "Entry Level",
              "start_date": "2024-04-01T00:00:00",
              "title": "Full-stack Developer",
              "years_at_company": "3 to 5 years",
              "years_at_company_raw": 2
            }
          ],
          "past": [
            {
              "business_email_verified": false,
              "company_headcount_latest": 31,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Ambalamedu, Karimugal, Brahmapuram, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "Financial Services"
              ],
              "company_professional_network_industry": "Financial Services",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/chillar-payment-solutions-pvt-ltd",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c1461d6c86c59d6588725661acfb8f99f6b2c11cfd420590caa2ab2e73a0a30e.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.chillarpayments.com",
              "employment_type": "",
              "end_date": "2024-02-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Kochi, Kerala, India"
              },
              "name": "Chillar Payment Solutions Pvt Ltd",
              "position_id": 2345492463,
              "professional_network_id": "4838079",
              "seniority_level": "Entry Level",
              "start_date": "2023-02-01T00:00:00",
              "title": "Node js  developer ",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            },
            {
              "business_email_verified": false,
              "company_headcount_latest": 26,
              "company_headcount_range": "11-50",
              "company_headquarters_country": "India",
              "company_hq_location": "Nadakavu, Vellayil, Kerala, India",
              "company_hq_location_address_components": [],
              "company_industries": [
                "Software Development"
              ],
              "company_professional_network_industry": "Software Development",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/armino",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/c76eca1d4c36bd77df7749fdd8fe6fc5892be6550cfa360939ad9600a8df756f.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.armino.in",
              "employment_type": "",
              "end_date": "2023-01-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "name": "Armino Technologies",
              "position_id": 2109353097,
              "professional_network_id": "4794009",
              "seniority_level": "Entry Level",
              "start_date": "2022-04-01T00:00:00",
              "title": "Full-stack Developer",
              "years_at_company": "Less than 1 year",
              "years_at_company_raw": 0
            },
            {
              "business_email_verified": false,
              "company_headcount_latest": 78,
              "company_headcount_range": "51-200",
              "company_headquarters_country": "United Arab Emirates",
              "company_hq_location": "Dubai, United Arab Emirates, Dubai, United Arab Emirates",
              "company_hq_location_address_components": [],
              "company_industries": [
                "IT Services and IT Consulting"
              ],
              "company_professional_network_industry": "IT Services and IT Consulting",
              "company_professional_network_profile_url": "https://www.linkedin.com/company/touchworld-technology-llc",
              "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/f41a352f83496982e49aa33309643e0b0376e62e83c1b24ee4d56cfab789f062.jpg",
              "company_status": "active",
              "company_type": "Privately Held",
              "company_website": "http://www.touchworldtech.com/",
              "employment_type": "",
              "end_date": "2022-04-01T00:00:00",
              "function_category": "Engineering",
              "is_default": false,
              "location": {
                "raw": "Infopark Campus, Kakkanad, kerala"
              },
              "name": "Touchworld Technology LLC",
              "position_id": 1816671046,
              "professional_network_id": "77120002",
              "seniority_level": "Entry Level",
              "start_date": "2020-09-01T00:00:00",
              "title": "NodeJS Developer",
              "years_at_company": "1 to 2 years",
              "years_at_company_raw": 1
            }
          ]
        }
      },
      "education": {
        "schools": [
          {
            "degree": "Master of Computer Applications - MCA",
            "description": "",
            "end_year": 2018,
            "institute_logo_permalink": "https://prod.api.futurejobs.ai/api/v1/static/0bbc69a7482faeeb25c7c75bb34ef7009acd19d73db72858a59c2a900dbaebe3.jpg",
            "location": {
              "city": null,
              "continent": "Asia",
              "country": "India",
              "raw": "APJ Abdul Kalam Technological University CET Campus",
              "state": "Kerala"
            },
            "professional_network_id": "13761916",
            "school": "APJ Abdul Kalam Technological University",
            "start_year": 2016
          }
        ]
      },
      "social_handles": {
        "dev_platform_identifier": {
          "profile_url": null
        },
        "professional_network_identifier": {
          "profile_url": "https://www.linkedin.com/in/keerthana-prakash-7010081a3"
        },
        "twitter_identifier": {
          "slug": ""
        }
      },
      "fit": "strong"
    },
    {
      "name": "Suji Sukumaran",
      "headline": "MERN Stack|NEXT JS | Nodejs|Python FastAPI",
      "region": "Chengannur, Kerala, India",
      "skills": [],
      "profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/1e5251386978d05ddb8c2b565d8a59e9408d528a8f22f76d5a3d56c2da85c44b.jpg",
      "linkedin_profile_url": "https://www.linkedin.com/in/suji-sukumaran-488b581b0",
      "emails": [],
      "open_to_cards": [],
      "current_employers": [
        {
          "name": "Diffrenz Business Solutions Pvt Ltd",
          "seniority_level": "Entry Level",
          "title": "Nodejs Developer",
          "company_headcount_range": "2-10",
          "years_at_company_raw": 1,
          "company_type": "Privately Held",
          "company_industries": [
            "Software Development"
          ],
          "company_hq_location": "Vadacode, Vadacode Kailas Colony, Thrikkakara, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2024-11-01T00:00:00",
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/diffrenz-business-solutions",
          "company_website_domain": "https://www.diffrenz.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/6509cd36f65b03e5c9ceb5f164d3512e6bcb4cfe7e63f1923f42f03f0b7b77dd.jpg",
          "company_headcount_latest": 32,
          "employment_type": "",
          "business_email_verified": false
        },
        {
          "name": "INMENZO TECHNOLOGIES LLP",
          "seniority_level": "Entry Level",
          "title": "Developer",
          "company_headcount_range": "2-10",
          "years_at_company_raw": 0,
          "company_type": "Partnership",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Pathanamthitta, Kerala, India",
          "function_category": "Engineering",
          "start_date": null,
          "end_date": null,
          "company_linkedin_profile_url": "https://www.linkedin.com/company/inmenzo",
          "company_website_domain": "http://www.inmenzo.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/a2ec9300f11cb6000c3889c2a90b601e4e398bd0cf858be473eea928e00c4ac5.jpg",
          "company_headcount_latest": 8,
          "employment_type": "",
          "business_email_verified": false
        }
      ],
      "past_employers": [
        {
          "name": "GTech",
          "seniority_level": "Entry Level",
          "title": "Teaching Faculty",
          "company_headcount_range": "201-500",
          "years_at_company_raw": 0,
          "company_type": "Privately Held",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Büyükdere, Istanbul, Türkiye",
          "function_category": "",
          "start_date": "2024-03-01T00:00:00",
          "end_date": "2024-11-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/gtechtr",
          "company_website_domain": "http://www.gtech.com.tr",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/10af907c81eac7bd2e071c56a61abbc05c7dffe0d1be4cd44f4e4f6c80172a77.jpg",
          "company_headcount_latest": 522,
          "employment_type": "",
          "business_email_verified": false
        },
        {
          "name": "INMENZO TECHNOLOGIES LLP",
          "seniority_level": "Entry Level",
          "title": "Software Developer",
          "company_headcount_range": "2-10",
          "years_at_company_raw": 3,
          "company_type": "Partnership",
          "company_industries": [
            "IT Services and IT Consulting"
          ],
          "company_hq_location": "Pathanamthitta, Kerala, India",
          "function_category": "Engineering",
          "start_date": "2020-06-01T00:00:00",
          "end_date": "2024-03-01T00:00:00",
          "company_linkedin_profile_url": "https://www.linkedin.com/company/inmenzo",
          "company_website_domain": "http://www.inmenzo.com",
          "company_profile_picture_permalink": "https://prod.api.futurejobs.ai/api/v1/static/a2ec9300f11cb6000c3889c2a90b601e4e398bd0cf858be473eea928e00c4ac5.jpg",
          "company_headcount_latest": 8,
          "employme
…[truncated 2330413 more chars]
# 2026-09-23T10:31:02.281Z POST /wl/search
curl -sS -X POST 'https://prod.api.futurejobs.ai/api/v1/wl/search' \
  -H 'Content-Type: application/json' \
  -H 'x-fj-api-key: fjk_sJCP5FZwo_iR_Zd8_Kc7_VWKh6Zgy9vMxG8aS354hiQ' \
  --data-raw '{"jdText":"nodejs developer from kannir","filters":{"region":{"type":"(.)","value":["kannir"]}}}'
