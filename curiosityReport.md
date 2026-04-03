# CWE: Common Weakness Enumeration 

## Introduction
CWE is a community-made list consisting of common security vulnerabilities present in various softwares. Each entry describes the issues, why it's vulnerable, and how to fix it. 

## Why I Chose CWE
I chose CWE because it's emphasis on prevention rather than fixing issues is really important to user-experience in software development. Inevitably there are going to be issues that appear when software is being deployed to a mass user base, and having clear guidance on how to prevent security issues beforehand is essential to protecting user data. Because of its unique solution to a common problem, I wanted to further research it.  

### What is Specified within each issue? (Example: Race Condition within a Thread)
- Description
  - The entry specifies what exactly the issue is and explains the shortcoming that comes with the issue.
  - E.g (When two threads of execution use a resource simultaneously, resources may be used while invalid)
- Common Consequences
  - Briefly explains the results or potential results of this security vulnerability being exploited.
  - E.g (Data could be altered in a bad state)
- Potential Mitigations
  - These are some suggested methods to prevent the security vulnerability from taking place. Sometimes there are multiple options
  - E.g (Use a locking functionality around the code)
- Relationships
  - Gives hyperlinks to various issues relating to the issue being addressed including what it is a member of and what issues it covers.
  - E.g (Member of Concurrency Issues)
- Applicable Platforms
  - Specifies languages and technologies where this vulnerability is present.
  - E.g (C, C++, Java, C#)
- Likelihood of Exploit
  - How likely is this vulnerability to be exposed
  - E.g (Medium)
- Demonstrative Examples: Show Code Blocks that display the vulnerability
- Detection Methods: Suggests certain methods to detect these vulnerabilities

### Hierarchy of Security Issues
The issues seen in the CVEs can be divided into weaknesses, patterns, and categories to compartmentalize each of the issues
- Design Weaknesses
  - Architectural decisions that create security flaws
- Implementation Weaknesses
  - Coding mistakes that lead to memory corruption or injection
- Configuration Weaknesses
  - Security issues caused through incorrect system or application configurations
 
### What I learned
- Security issues come through the form of bad architecture as well as system issues
- SAST and DAST Security Systems use CWE IDs to tag findings
- CWE-79 for example can identify security issues in a code block like so:
  import sqlite3

  def get_user_data(username):
      conn = sqlite3.connect('users.db')
      cursor = conn.cursor()
      query = f"SELECT * FROM users WHERE username = '{username}'"
      cursor.execute(query)
      return cursor.fetchall()

  This code leaves a real possibility of SQL Injection

  Through using CWEs, the "{username}" text is changed to a "?"
- CWE has a top 25 list of security vulnerabilities to be cautious of
- They prioritize in this way so developers can identify high security bugs when a scanner is ran against the code. This is especially useful for identifying patterns of insecurity within the code

### Personal Takeaways
- I've had experiences in my own work and internships where data had to be transported or created in very specific and curated ways in order to maintain security protocol and I appreciate now that there's a clear compendium of issues that can help me make sense of these principles
- In exploring it, I liked seeing how scanners were used to identify issues and associate them with CWE IDs, it's a very streamlined system that I believe does a lot of good for development.
- In my own projects, I will use this feature in the future to make sense of security principles and why they're important. In my future employment doing full-time software engineering work, I will maintain these principles and show them to my team.
- This is personally important to me because I've had moments where I stumbled across webpages that had been exploited and it puts the users of the website at real risk of cyberattacks and private data being breached. I like how this makes this process easier for not only how it helps developers but how it helps everybody.  

### Final Thoughts
CWEs offer a list of important security vulnerabilties with clear examples and suggested fixes that developers use to identify patterns and isolate issues within their code and architecture. 
