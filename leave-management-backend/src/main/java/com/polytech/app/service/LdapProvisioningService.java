package com.polytech.app.service;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.*;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.Hashtable;

@ApplicationScoped
public class LdapProvisioningService {

	private DirContext newContext() throws NamingException {
		Hashtable<String, String> env = new Hashtable<>();
		env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
		env.put(Context.PROVIDER_URL, "ldap://polytech.ddns.net:389");
		env.put(Context.SECURITY_AUTHENTICATION, "simple");
		env.put(Context.SECURITY_PRINCIPAL, "cn=admin,dc=polytech,dc=local");
		env.put(Context.SECURITY_CREDENTIALS, "admin");
		return new InitialDirContext(env);
	}

	public void createLdapUser(String employeeCode, String firstName, String lastName, String initialPassword,
			String roleName) throws NamingException {

		String userDn = "uid=" + employeeCode + ",ou=Users,dc=polytech,dc=local";

		DirContext ctx = newContext();
		try {
			Attributes attrs = new BasicAttributes(true);

			Attribute oc = new BasicAttribute("objectClass");
			oc.add("inetOrgPerson");
			oc.add("top");
			attrs.put(oc);

			attrs.put("uid", employeeCode);
			attrs.put("cn", firstName + " " + lastName);
			attrs.put("sn", lastName);
			attrs.put("displayName", firstName + " " + lastName);

			attrs.put("userPassword", initialPassword);

			ctx.createSubcontext(userDn, attrs);

			String groupCn = switch (roleName) {
			case "MANAGER" -> "MANAGER";
			case "HR" -> "HR";
			default -> "EMPLOYEE";
			};

			String groupDn = "cn=" + groupCn + ",ou=Groups,dc=polytech,dc=local";

			ModificationItem[] mods = new ModificationItem[1];
			Attribute member = new BasicAttribute("member", userDn);
			mods[0] = new ModificationItem(DirContext.ADD_ATTRIBUTE, member);

			ctx.modifyAttributes(groupDn, mods);

		} finally {
			ctx.close();
		}
	}

	public void deleteLdapUser(String employeeCode) throws NamingException {
		String userDn = "uid=" + employeeCode + ",ou=Users,dc=polytech,dc=local";

		DirContext ctx = newContext();
		try {
			String[] groups = { "EMPLOYEE", "MANAGER", "HR" };

			for (String groupCn : groups) {
				String groupDn = "cn=" + groupCn + ",ou=Groups,dc=polytech,dc=local";
				try {
					ModificationItem[] mods = new ModificationItem[1];
					Attribute member = new BasicAttribute("member", userDn);
					mods[0] = new ModificationItem(DirContext.REMOVE_ATTRIBUTE, member);
					ctx.modifyAttributes(groupDn, mods);
				} catch (NamingException e) {
					// user not in this group, ignore
				}
			}

			ctx.destroySubcontext(userDn);

		} finally {
			ctx.close();
		}
	}

	public void changeUserPassword(String employeeCode, String oldPassword, String newPassword) throws NamingException {
		String userDn = "uid=" + employeeCode + ",ou=Users,dc=polytech,dc=local";

		Hashtable<String, String> env = new Hashtable<>();
		env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
		env.put(Context.PROVIDER_URL, "ldap://polytech.ddns.net:389");
		env.put(Context.SECURITY_AUTHENTICATION, "simple");
		env.put(Context.SECURITY_PRINCIPAL, userDn);
		env.put(Context.SECURITY_CREDENTIALS, oldPassword);

		DirContext userCtx = new InitialDirContext(env);
		try {
			ModificationItem[] mods = new ModificationItem[1];
			Attribute mod = new BasicAttribute("userPassword", newPassword);
			mods[0] = new ModificationItem(DirContext.REPLACE_ATTRIBUTE, mod);

			userCtx.modifyAttributes(userDn, mods);
		} finally {
			userCtx.close();
		}
	}
}