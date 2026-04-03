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

### Final Thoughts
CWEs offer a list of important security vulnerabilties with clear examples and suggested fixes that developers use to identify patterns and isolate issues within their code and architecture. 
